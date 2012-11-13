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
import org.structr.common.ThumbnailParameters;
import org.structr.common.property.Property;
import org.structr.core.GraphObject;
import org.structr.core.converter.PropertyConverter;
import org.structr.core.converter.ThumbnailConverter;
import org.structr.core.entity.Image;

//~--- classes ----------------------------------------------------------------

/**
 *
 * @author Axel Morgner
 */
public class ThumbnailProperty<T> extends Property<Image> {

	private ThumbnailParameters tnParams = null;

	//~--- constructors ---------------------------------------------------

	public ThumbnailProperty(final String name, final ThumbnailParameters tnParams) {

		super(name);
		
		this.isSystemProperty = true;
		this.tnParams    = tnParams;

	}

	@Override
	public String typeName() {
		return ""; // read-only
	}

	@Override
	public PropertyConverter<Image, ?> databaseConverter(SecurityContext securityContext, GraphObject entity) {

		return new ThumbnailConverter(securityContext, entity, tnParams);

	}

	@Override
	public PropertyConverter<?, Image> inputConverter(SecurityContext securityContext) {

		return null;

	}

}
