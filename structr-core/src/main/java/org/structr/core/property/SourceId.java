/**
 * Copyright (C) 2010-2014 Structr, c/o Morgner UG (haftungsbeschränkt) <structr@structr.org>
 *
 * This file is part of Structr <http://structr.org>.
 *
 * Structr is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * Structr is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Structr.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.structr.core.property;

import org.neo4j.graphdb.Relationship;
import org.structr.common.SecurityContext;
import org.structr.common.error.FrameworkException;
import org.structr.core.GraphObject;
import org.structr.core.converter.PropertyConverter;
import org.structr.core.graph.NodeFactory;
import org.structr.core.graph.NodeInterface;
import org.structr.core.graph.RelationshipInterface;

/**
 *
 * @author Christian Morgner
 */
public class SourceId extends Property<String> {

	public SourceId(final String name) {
		super(name);
	}
	
	@Override
	public Class relatedType() {
		return null;
	}

	@Override
	public String getProperty(final SecurityContext securityContext, final GraphObject obj, final boolean applyConverter) {
		
		if (obj instanceof RelationshipInterface) {
		
			try {
				final Relationship relationship = ((RelationshipInterface)obj).getRelationship();
				final NodeInterface startNode   = new NodeFactory<>(securityContext).instantiate(relationship.getStartNode());
				
				return startNode.getUuid();
				
			} catch (Throwable t) {
				
				t.printStackTrace();
			}
		}
		
		return null;
	}

	@Override
	public void setProperty(SecurityContext securityContext, GraphObject obj, String value) throws FrameworkException {
		
		if (obj instanceof RelationshipInterface) {
		
			try {
				((RelationshipInterface)obj).setSourceNodeId(value);
				
			} catch (Throwable t) {
				
				t.printStackTrace();
			}
		}
	}

	@Override
	public boolean isCollection() {
		return false;
	}

	@Override
	public Integer getSortType() {
		return null;
	}

	@Override
	public Object fixDatabaseProperty(Object value) {
		return null;
	}

	@Override
	public Object getValueForEmptyFields() {
		return null;
	}

	@Override
	public String typeName() {
		return null;
	}

	@Override
	public PropertyConverter<String, ?> databaseConverter(SecurityContext securityContext) {
		return null;
	}

	@Override
	public PropertyConverter<String, ?> databaseConverter(SecurityContext securityContext, GraphObject entity) {
		return null;
	}

	@Override
	public PropertyConverter<?, String> inputConverter(SecurityContext securityContext) {
		return null;
	}
}
