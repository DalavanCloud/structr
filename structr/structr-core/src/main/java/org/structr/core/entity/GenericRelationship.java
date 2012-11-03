/*
 *  Copyright (C) 2010-2012 Axel Morgner, structr <structr@structr.org>
 *
 *  This file is part of structr <http://structr.org>.
 *
 *  structr is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  structr is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with structr.  If not, see <http://www.gnu.org/licenses/>.
 */



package org.structr.core.entity;


//~--- JDK imports ------------------------------------------------------------

import java.util.LinkedHashSet;
import java.util.Set;
import org.neo4j.graphdb.Relationship;
import org.structr.common.property.Property;
import org.structr.common.property.PropertyKey;
import org.structr.common.property.PropertyMap;
import org.structr.common.PropertyView;
import org.structr.common.SecurityContext;
import org.structr.common.View;
import org.structr.common.error.ErrorBuffer;
import org.structr.common.error.FrameworkException;
import org.structr.core.EntityContext;
import org.structr.core.node.NodeService.RelationshipIndex;

//~--- classes ----------------------------------------------------------------

/**
 *
 * @author amorgner
 *
 */
public class GenericRelationship extends AbstractRelationship {

	public static final Property<String> startNodeId = new Property<String>("startNodeId");
	public static final Property<String> endNodeId   = new Property<String>("endNodeId");

	public static final View uiView = new View(GenericRelationship.class, PropertyView.Ui,
		startNodeId, endNodeId
	);
	
	static {

//		EntityContext.registerPropertySet(GenericRelationship.class, PropertyView.All, Key.values());

		EntityContext.registerSearchableProperty(GenericRelationship.class, RelationshipIndex.rel_uuid.name(), AbstractRelationship.uuid);
		
		// register start and end node for ui view
//		EntityContext.registerPropertySet(GenericRelationship.class, PropertyView.Ui, UiKey.values());
		
	}
	
	//~--- constructors ---------------------------------------------------

	public GenericRelationship() {}

	public GenericRelationship(SecurityContext securityContext, Relationship dbRelationship) {
		init(securityContext, dbRelationship);
	}

	@Override
	public PropertyKey getStartNodeIdKey() {
		return startNodeId;
	}

	@Override
	public PropertyKey getEndNodeIdKey() {
		return endNodeId;
	}
		
	@Override
	public Iterable<PropertyKey> getPropertyKeys(String propertyView) {
		
		Set<PropertyKey> keys = new LinkedHashSet<PropertyKey>();
		
		keys.add(startNodeId);
		keys.add(endNodeId);
		
		if(dbRelationship != null) {
			
			for(String key : dbRelationship.getPropertyKeys()) {
				keys.add(EntityContext.getPropertyKeyForName(entityType, key));
			}
		}
		
		return keys;
	}

	@Override
	public boolean beforeCreation(SecurityContext securityContext, ErrorBuffer errorBuffer) throws FrameworkException {
		return true;
	}

	@Override
	public boolean beforeModification(SecurityContext securityContext, ErrorBuffer errorBuffer) throws FrameworkException {
		return true;
	}

	@Override
	public boolean beforeDeletion(SecurityContext securityContext, ErrorBuffer errorBuffer, PropertyMap properties) throws FrameworkException {
		return true;
	}

	@Override
	public boolean isValid(ErrorBuffer errorBuffer) {
		return true;
	}
}
