/**
 * Copyright (C) 2010-2013 Axel Morgner, structr <structr@structr.org>
 *
 * This file is part of structr <http://structr.org>.
 *
 * structr is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * structr is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with structr.  If not, see <http://www.gnu.org/licenses/>.
 */



package org.structr.websocket;

import com.google.gson.Gson;

import org.structr.common.RelType;
import org.structr.common.SecurityContext;
import org.structr.common.error.ErrorBuffer;
import org.structr.core.GraphObject;
import org.structr.core.StructrTransactionListener;
import org.structr.core.entity.AbstractNode;
import org.structr.core.entity.AbstractRelationship;
import org.structr.websocket.message.WebSocketMessage;

import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.eclipse.jetty.websocket.WebSocket.Connection;

import org.structr.common.error.FrameworkException;
import org.structr.core.entity.LinkedTreeNode;
import org.structr.core.property.PropertyKey;
import org.structr.core.property.PropertyMap;
import org.structr.core.property.StringProperty;
import org.structr.web.entity.dom.DOMNode;

import org.w3c.dom.Node;

/**
 *
 * @author Christian Morgner
 */
public class SynchronizationController implements StructrTransactionListener {

	private static final Logger logger                              = Logger.getLogger(SynchronizationController.class.getName());
	private final Set<StructrWebSocket> clients                     = new LinkedHashSet<StructrWebSocket>();
	private final Map<Long, List<WebSocketMessage>> messageStackMap = new LinkedHashMap<Long, List<WebSocketMessage>>();
	private List<WebSocketMessage> messageStack                     = null;
	private Gson gson                                               = null;

	public SynchronizationController(Gson gson) {

		this.gson = gson;

	}

	public void registerClient(StructrWebSocket client) {

		synchronized (clients) {

			clients.add(client);
		}

	}

	public void unregisterClient(StructrWebSocket client) {

		synchronized (clients) {

			clients.remove(client);
		}

	}

	// ----- private methods -----
	private void broadcast(final WebSocketMessage webSocketData) {

		logger.log(Level.FINE, "Broadcasting message to {0} clients..", clients.size());

		// session must be valid to be received by the client
		webSocketData.setSessionValid(true);

		String message;

		synchronized (clients) {

			// create message
			for (StructrWebSocket socket : clients) {

				Connection socketConnection = socket.getConnection();

				webSocketData.setCallback(socket.getCallback());

				if ((socketConnection != null) && socket.isAuthenticated()) {

					List<? extends GraphObject> result = webSocketData.getResult();

					if ((result != null) && (result.size() > 0)
						&& (webSocketData.getCommand().equals("UPDATE") || webSocketData.getCommand().equals("ADD") || webSocketData.getCommand().equals("CREATE"))) {

						WebSocketMessage clientData     = webSocketData.copy();
						SecurityContext securityContext = socket.getSecurityContext();

						clientData.setResult(filter(securityContext, result));

						message = gson.toJson(clientData, WebSocketMessage.class);

					} else {

						message = gson.toJson(webSocketData, WebSocketMessage.class);
					}

					logger.log(Level.FINE, "############################################################ SENDING \n{0}", message);

					try {

						socketConnection.sendMessage(message);

					} catch (org.eclipse.jetty.io.EofException eof) {

						logger.log(Level.FINE, "EofException irgnored, may occour on SSL connections.", eof);

					} catch (Throwable t) {

						logger.log(Level.WARNING, "Error sending message to client.", t);

					}

				}

			}
		}

	}

	private List<? extends GraphObject> filter(final SecurityContext securityContext, final List<? extends GraphObject> all) {

		List<GraphObject> filteredResult = new LinkedList<GraphObject>();

		for (GraphObject obj : all) {

			if (securityContext.isVisible((AbstractNode) obj)) {

				filteredResult.add(obj);
			}

		}

		return filteredResult;

	}

	// ----- interface StructrTransactionListener -----
	@Override
	public void begin(SecurityContext securityContext, long transactionKey) {

		messageStack = new LinkedList<WebSocketMessage>();

		messageStackMap.put(transactionKey, messageStack);

	}

	@Override
	public void commit(SecurityContext securityContext, long transactionKey) {

		messageStack = messageStackMap.get(transactionKey);

		if (messageStack != null) {

			for (WebSocketMessage message : messageStack) {

				broadcast(message);
			}

		} else {

			logger.log(Level.WARNING, "No message found for transaction key {0}", transactionKey);
		}

		messageStackMap.remove(transactionKey);

	}

	@Override
	public void rollback(SecurityContext securityContext, long transactionKey) {

		// roll back transaction
		messageStackMap.remove(transactionKey);
	}

	@Override
	public boolean propertyModified(SecurityContext securityContext, long transactionKey, ErrorBuffer errorBuffer, GraphObject graphObject, PropertyKey key, Object oldValue, Object newValue) {

		messageStack = messageStackMap.get(transactionKey);

		WebSocketMessage message = new WebSocketMessage();

		message.setCommand("UPDATE");

		String uuid = graphObject.getProperty(AbstractNode.uuid);

		if (graphObject instanceof AbstractRelationship) {

			AbstractRelationship relationship = (AbstractRelationship) graphObject;
			AbstractNode startNode            = relationship.getStartNode();
			AbstractNode endNode              = relationship.getEndNode();

			try {

				PropertyMap relProperties = relationship.getProperties();

				relProperties.put(new StringProperty("startNodeId"), startNode.getUuid());
				relProperties.put(new StringProperty("endNodeId"), endNode.getUuid());

				Map<String, Object> properties = PropertyMap.javaTypeToInputType(securityContext, relationship.getClass(), relProperties);

				message.setRelData(properties);

			} catch (FrameworkException fex) {

				logger.log(Level.WARNING, "Unable to convert properties from type {0} to input type", relationship.getClass());

			}

		} else if (graphObject instanceof AbstractNode) {

			AbstractNode node = (AbstractNode) graphObject;

			try {

				Map<String, Object> nodeProperties = new HashMap<String, Object>();

				nodeProperties.put(key.dbName(), newValue);
				nodeProperties.put(AbstractNode.type.dbName(), node.getType());    // needed for type resolution

				Map<String, Object> properties = PropertyMap.javaTypeToInputType(securityContext, node.getClass(),
									 PropertyMap.databaseTypeToJavaType(securityContext, graphObject, nodeProperties));

				properties.remove(AbstractNode.type.jsonName());    // remove type again
				message.setNodeData(properties);

			} catch (FrameworkException fex) {

				logger.log(Level.WARNING, "Unable to convert properties from type {0} to input type", node.getClass());

			}

		}

		message.setId(uuid);
		message.setGraphObject(graphObject);
		message.getModifiedProperties().add(key);
		messageStack.add(message);

		return true;

	}

	@Override
	public boolean propertyRemoved(SecurityContext securityContext, long transactionKey, ErrorBuffer errorBuffer, GraphObject graphObject, PropertyKey key, Object oldValue) {

		messageStack = messageStackMap.get(transactionKey);

		WebSocketMessage message = new WebSocketMessage();

		message.setCommand("UPDATE");

		String uuid = graphObject.getProperty(AbstractNode.uuid);

		if (graphObject instanceof AbstractRelationship) {

			AbstractRelationship relationship = (AbstractRelationship) graphObject;
			AbstractNode startNode            = relationship.getStartNode();
			AbstractNode endNode              = relationship.getEndNode();

			try {

				PropertyMap relProperties = relationship.getProperties();

				relProperties.put(new StringProperty("startNodeId"), startNode.getUuid());
				relProperties.put(new StringProperty("endNodeId"), endNode.getUuid());

				Map<String, Object> properties = PropertyMap.javaTypeToInputType(securityContext, relationship.getClass(), relProperties);

				message.setRelData(properties);

			} catch (FrameworkException fex) {

				logger.log(Level.WARNING, "Unable to convert properties from type {0} to input type", relationship.getClass());

			}

		}

		message.setId(uuid);
		message.setGraphObject(graphObject);
		message.getRemovedProperties().add(key);
		messageStack.add(message);

		return true;

	}

	@Override
	public boolean graphObjectCreated(SecurityContext securityContext, long transactionKey, ErrorBuffer errorBuffer, GraphObject graphObject) {

		messageStack = messageStackMap.get(transactionKey);

		AbstractRelationship relationship;

		if (graphObject instanceof AbstractRelationship) {

			relationship = (AbstractRelationship) graphObject;

			if (!ignoreRelationship(relationship)) {

				AbstractNode startNode   = (AbstractNode) relationship.getStartNode();
				AbstractNode endNode     = (AbstractNode) relationship.getEndNode();
				WebSocketMessage message = new WebSocketMessage();

				message.setResult(Arrays.asList(new GraphObject[] { endNode }));
				message.setId(endNode.getUuid());
				message.setNodeData("parentId", startNode.getUuid());

				Node refNode = null;

				if (endNode instanceof DOMNode) {

					refNode = ((DOMNode) endNode).getNextSibling();
				}

				if (refNode != null) {

					message.setCommand("INSERT_BEFORE");
					message.setNodeData("refId", ((AbstractNode) refNode).getUuid());

				} else {

					message.setCommand("APPEND_CHILD");
				}

				// message.setResult(Arrays.asList(new GraphObject[] { endNode }));
				messageStack.add(message);
				logger.log(Level.FINE, "Relationship created: {0}({1} -> {2}{3}", new Object[] { startNode.getId(), startNode.getProperty(AbstractNode.uuid),
					endNode.getProperty(AbstractNode.uuid) });

			}

		} else {

			WebSocketMessage message = new WebSocketMessage();

			message.setCommand("CREATE");
			message.setGraphObject(graphObject);

			List<GraphObject> list = new LinkedList<GraphObject>();

			list.add(graphObject);
			message.setResult(list);
			messageStack.add(message);
			logger.log(Level.FINE, "Node created: {0}", ((AbstractNode) graphObject).getProperty(AbstractNode.uuid));

		}

		return true;

	}

	@Override
	public boolean graphObjectModified(SecurityContext securityContext, long transactionKey, ErrorBuffer errorBuffer, GraphObject graphObject) {

//              messageStack = messageStackMap.get(transactionKey);
//
//              WebSocketMessage message = new WebSocketMessage();
//              String uuid              = graphObject.getProperty("uuid").toString();
//
//              message.setId(uuid);
//              message.setCommand("UPDATE");
//              message.setGraphObject(graphObject);
//              messageStack.add(message);
		return true;
	}

	@Override
	public boolean graphObjectDeleted(SecurityContext securityContext, long transactionKey, ErrorBuffer errorBuffer, GraphObject obj, PropertyMap properties) {

		messageStack = messageStackMap.get(transactionKey);

		AbstractRelationship relationship;

		if ((obj != null) && (obj instanceof AbstractRelationship)) {

			relationship = (AbstractRelationship) obj;

			if (ignoreRelationship(relationship)) {

				return true;
			}

			// do not access nodes of delete relationships
			// AbstractNode startNode   = relationship.getStartNode();
			// AbstractNode endNode     = relationship.getEndNode();
			WebSocketMessage message = new WebSocketMessage();
			String startNodeId       = relationship.getCachedStartNodeId();
			String endNodeId         = relationship.getCachedEndNodeId();
			String pageId            = properties.get(new StringProperty("pageId"));

			if ((startNodeId != null) && (endNodeId != null)) {

				message.setCommand("REMOVE_CHILD");

				// message.setGraphObject(relationship);
				message.setId(endNodeId);
				message.setNodeData("parentId", startNodeId);

//                              message.setNodeData("pageId", pageId);
				messageStack.add(message);

			}

			// logger.log(Level.FINE, "{0} -> {1}", new Object[] { startNode.getId(), endNode.getId() });

		} else {

			WebSocketMessage message = new WebSocketMessage();
			String uuid              = properties.get(AbstractNode.uuid).toString();

			message.setId(uuid);
			message.setCommand("DELETE");
			messageStack.add(message);

		}

		return true;

	}

	/**
	 * Ignore all relationships which should not trigger an UI update at all
	 * 
	 * @param rel
	 * @return 
	 */
	private boolean ignoreRelationship(final AbstractRelationship rel) {

		String relType = rel.getRelType().name();

		if (relType.equals("CONTAINS")) {

			return false;
		}

		if (relType.equals("OWNS")) {

			return true;
		}

		if (relType.equals("SECURITY")) {

			return true;
		}

		if (relType.endsWith(LinkedTreeNode.LIST_KEY_SUFFIX)) {

			return true;
		}

		return false;

	}

}
