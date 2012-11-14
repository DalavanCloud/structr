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

import java.text.SimpleDateFormat;
import java.util.Date;
import org.apache.lucene.search.SortField;
import org.structr.common.SecurityContext;
import org.structr.common.error.DateFormatToken;
import org.structr.common.error.FrameworkException;
import org.structr.core.GraphObject;
import org.structr.core.converter.PropertyConverter;

/**
 *
 * @author Christian Morgner
 */
public class DateProperty extends Property<Date> {
	
	private SimpleDateFormat dateFormat = null;
	
	public DateProperty(String name, String pattern) {
		super(name);
		
		dateFormat = new SimpleDateFormat(pattern);
	}
	
	@Override
	public String typeName() {
		return "String";
	}
	
	@Override
	public PropertyConverter<Date, Long> databaseConverter(SecurityContext securityContext, GraphObject entity) {
		return new DatabaseConverter(securityContext, entity);
	}

	@Override
	public PropertyConverter<String, Date> inputConverter(SecurityContext securityContext) {
		return new InputConverter(securityContext);
	}
	
	private class DatabaseConverter extends PropertyConverter<Date, Long> {

		public DatabaseConverter(SecurityContext securityContext, GraphObject entity) {
			super(securityContext, entity);
		}
		
		@Override
		public Long convert(Date source) throws FrameworkException {

			if (source != null) {
				
				return source.getTime();
			}
			
			return null;
		}

		@Override
		public Date revert(Long source) throws FrameworkException {

			if (source != null) {

				return new Date(source);
			}

			return null;
			
		}
	}
	
	private class InputConverter extends PropertyConverter<String, Date> {

		public InputConverter(SecurityContext securityContext) {
			super(securityContext, null);
		}

		@Override
		public Date convert(String source) throws FrameworkException {

			if (source != null) {

				try {
					return dateFormat.parse(source);

				} catch(Throwable t) {

					throw new FrameworkException(declaringClassName, new DateFormatToken(DateProperty.this));
				}

			}

			return null;
			
		}
		
		@Override
		public String revert(Date source) throws FrameworkException {

			if (source != null) {
				return dateFormat.format(source);
			}
			
			return null;
		}
		
		@Override
		public Integer getSortType() {
			return SortField.LONG;
		}
		
	}
}
