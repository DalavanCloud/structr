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
package org.structr.core.property;

import org.structr.common.SecurityContext;
import org.structr.core.GraphObject;
import org.structr.core.converter.PropertyConverter;
import org.structr.core.converter.PropertyMapper;

/**
 *
 * @author Christian Morgner
 */
public class MappedProperty<T> extends PrimitiveProperty<T> {
	
	private PropertyKey<T> mappedKey = null;
	
	public MappedProperty(String name, PropertyKey<T> mappedKey) {
		super(name);
		
		this.mappedKey = mappedKey;
	}
	
	public PropertyKey<T> mappedKey() {
		return mappedKey;
	}
	
	@Override
	public String typeName() {
		return mappedKey.typeName();
	}
	
	@Override
	public PropertyConverter<T, ?> databaseConverter(SecurityContext securityContext, GraphObject entity) {
		return new PropertyMapper(securityContext, entity, mappedKey);
	}

	@Override
	public PropertyConverter<?, T> inputConverter(SecurityContext securityContext) {
		return mappedKey.inputConverter(securityContext);
	}
	

	@Override
	public Object fixDatabaseProperty(Object value) {
		return null;
	}
}
