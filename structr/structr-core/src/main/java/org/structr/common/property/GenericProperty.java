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


//~--- JDK imports ------------------------------------------------------------

import java.lang.reflect.ParameterizedType;
import org.structr.common.SecurityContext;
import org.structr.common.error.FrameworkException;
import org.structr.core.GraphObject;
import org.structr.core.converter.PropertyConverter;

//~--- classes ----------------------------------------------------------------

/**
 *
 * @author Christian Morgner
 */
public class GenericProperty<T> extends Property<T> {

	//~--- constructors ---------------------------------------------------

	public GenericProperty(String name) {

		this(name, name);

	}

	public GenericProperty(String jsonName, String dbName) {

		super(jsonName, dbName);

	}

	//~--- methods --------------------------------------------------------

	@Override
	public String typeName() {

		ParameterizedType pType = (ParameterizedType) getClass().getGenericSuperclass();

		if ("T".equals(pType.getRawType().toString())) {

			Class<? extends GraphObject> relType = relatedType();

			return relType != null
			       ? relType.getSimpleName()
			       : null;

		}

		return pType.getRawType().toString();

	}

	@Override
	public Object fixDatabaseProperty(Object value) {

		return null;

	}

	@Override
	public PropertyConverter<T, ?> databaseConverter(SecurityContext securityContext, GraphObject entitiy) {
		return null;
	}

	@Override
	public PropertyConverter<?, T> inputConverter(SecurityContext securityContext) {
		return null;
	}

	@Override
	public Class<? extends GraphObject> relatedType() {
		return null;
	}

	//~--- get methods ----------------------------------------------------

	@Override
	public boolean isCollection() {
		return false;
	}

	@Override
	public T getProperty(SecurityContext securityContext, GraphObject obj, boolean applyConverter) {
		return null;
	}

	@Override
	public void setProperty(SecurityContext securityContext, GraphObject obj, T value) throws FrameworkException {
	}
}
