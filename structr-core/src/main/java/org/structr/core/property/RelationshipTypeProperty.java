/**
 * Copyright (C) 2010-2014 Morgner UG (haftungsbeschränkt)
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

import org.structr.common.SecurityContext;
import org.structr.common.error.FrameworkException;
import org.structr.core.GraphObject;
import org.structr.core.app.StructrApp;
import org.structr.core.graph.RelationshipInterface;
import org.structr.core.graph.TransactionCommand;

/**
 *
 * @author Christian Morgner
 */
public class RelationshipTypeProperty extends AbstractReadOnlyProperty<String> {

	public RelationshipTypeProperty(final String name) {
		super(name);
	}
	
	@Override
	public Class relatedType() {
		return null;
	}

	@Override
	public String getProperty(SecurityContext securityContext, GraphObject obj, boolean applyConverter) {
		return getProperty(securityContext, obj, applyConverter, null);
	}

	@Override
	public String getProperty(SecurityContext securityContext, GraphObject obj, boolean applyConverter, final org.neo4j.helpers.Predicate<GraphObject> predicate) {
		
		if (obj instanceof RelationshipInterface) {
			
			try (final TransactionCommand cmd = StructrApp.getInstance(securityContext).beginTx()) {
				
				return ((RelationshipInterface)obj).getRelType().name();
				
			} catch (FrameworkException fex) {
				// ignore
			}
		}
		
		return null;
	}

	@Override
	public boolean isCollection() {
		return false;
	}

	@Override
	public Integer getSortType() {
		return null;
	}
}
