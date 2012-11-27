/*
 *  Copyright (C) 2012 Axel Morgner
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
package org.structr.common.property;

import org.structr.core.property.PropertyKey;
import org.structr.common.SecurityContext;
import org.structr.core.GraphObject;
import org.structr.core.entity.AbstractNode;
import org.structr.core.entity.AbstractRelationship;

/**
 *
 * @author Christian Morgner
 */
public class EndNodeGroup extends GroupProperty {
	
	public EndNodeGroup(String name, Class<? extends GraphObject> entityClass, PropertyKey... properties) {
		super(name, entityClass, properties);
	}

	@Override
	public PropertyMap getGroupedProperties(SecurityContext securityContext, GraphObject source) {

		if(source instanceof AbstractRelationship) {

			AbstractRelationship rel = (AbstractRelationship)source;
			AbstractNode end         = rel.getEndNode();

			return super.getGroupedProperties(securityContext, end);
		}

		return null;
	}

	@Override
	public Object fixDatabaseProperty(Object value) {
		return null;
	}
}
