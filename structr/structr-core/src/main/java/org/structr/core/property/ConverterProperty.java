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

import java.lang.reflect.Constructor;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.structr.common.SecurityContext;
import org.structr.core.EntityContext;
import org.structr.core.GraphObject;
import org.structr.core.converter.PropertyConverter;
import org.structr.core.property.PrimitiveProperty;

/**
 *
 * @author Christian Morgner
 */
public class ConverterProperty<T> extends PrimitiveProperty<T> {
	
	private static final Logger logger = Logger.getLogger(ConverterProperty.class.getName());
	private Constructor constructor    = null;
	
	public ConverterProperty(String name, Class<? extends PropertyConverter<?, T>> converterClass) {
		
		super(name);
		
		try {
			this.constructor = converterClass.getConstructor(SecurityContext.class, GraphObject.class);
			
		} catch(NoSuchMethodException nsmex) {
			
			logger.log(Level.SEVERE, "Unable to instantiate converter of type {0} for key {1}", new Object[] {
				converterClass.getName(),
				name
			});
		}
		
		// make us known to the entity context
		EntityContext.registerConvertedProperty(this);
	}
	
	@Override
	public String typeName() {
		return ""; // read-only
	}
	
	@Override
	public Object fixDatabaseProperty(Object value) {
		return null;
	}

	@Override
	public PropertyConverter<T, ?> databaseConverter(SecurityContext securityContext, GraphObject entity) {
		return createConverter(securityContext, entity);
	}

	@Override
	public PropertyConverter<?, T> inputConverter(SecurityContext securityContext) {
		return null;
	}
	
	private PropertyConverter createConverter(SecurityContext securityContext, GraphObject entity) {
		
		try {
			
			return (PropertyConverter<?, T>)constructor.newInstance(securityContext, entity);
			
		} catch(Throwable t) {
			
			logger.log(Level.SEVERE, "Unable to instantiate converter of type {0} for key {1}", new Object[] {
				constructor.getClass().getName(),
				dbName
			});
		}
		
		return null;
	}
}
