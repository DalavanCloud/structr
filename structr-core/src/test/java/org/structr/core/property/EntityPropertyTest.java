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
package org.structr.core.property;

import java.util.List;
import static junit.framework.Assert.assertEquals;
import static junit.framework.Assert.assertNotNull;
import static junit.framework.Assert.fail;
import org.structr.common.StructrTest;
import org.structr.common.error.FrameworkException;
import org.structr.core.Services;
import org.structr.core.converter.PropertyConverter;
import org.structr.core.entity.AbstractNode;
import org.structr.core.entity.TestThree;
import org.structr.core.entity.TestSix;
import org.structr.core.graph.StructrTransaction;
import org.structr.core.graph.TransactionCommand;

/**
 *
 * @author Christian Morgner
 */
public class EntityPropertyTest extends StructrTest {

	public void testOneToOne() throws Exception {
		
		final TestSix a   = createTestNode(TestSix.class);
		final TestSix c   = createTestNode(TestSix.class);
		final TestThree b = createTestNode(TestThree.class);
		final TestThree d = createTestNode(TestThree.class);
		
		try {

			app.beginTx();
			a.setProperty(AbstractNode.name, "a");
			c.setProperty(AbstractNode.name, "c");
			b.setProperty(AbstractNode.name, "b");
			d.setProperty(AbstractNode.name, "d");
			app.commitTx();
			
		} catch (FrameworkException fex) {
		
			fex.printStackTrace();
			
			fail("Unable to create test nodes");

		} finally {

			app.finishTx();
		}
		
		assertNotNull(a);
		assertNotNull(c);
		assertNotNull(b);
		assertNotNull(d);

		/**
		 * We test the following here:
		 * A -> B
		 * C -> D
		 * 
		 * then connect A -> D, so C and B should not
		 * be related any more
		 */

		// create two connections
		try {

			app.beginTx();
			a.setProperty(TestSix.oneToOneTestThree, b);
			c.setProperty(TestSix.oneToOneTestThree, d);
			app.commitTx();
			
		} catch (FrameworkException fex) {
		
			fex.printStackTrace();
			
			fail("Unable to link test nodes");

		} finally {

			app.finishTx();
		}
		
		// verify connections
		TestThree verifyB = a.getProperty(TestSix.oneToOneTestThree);
		TestThree verifyD = c.getProperty(TestSix.oneToOneTestThree);
		
		assertTrue(verifyB != null && verifyB.equals(b));
		assertTrue(verifyD != null && verifyD.equals(d));
		
		try {

			app.beginTx();
			a.setProperty(TestSix.oneToOneTestThree, d);
			app.commitTx();
			
		} catch (FrameworkException fex) {
		
			fex.printStackTrace();
			
			fail("Unable to link test nodes");

		} finally {

			app.finishTx();
		}
		

		// verify connection
		TestThree verifyD2 = a.getProperty(TestSix.oneToOneTestThree);
		assertTrue(verifyD2 != null && verifyD2.equals(d));

		// testSix2 should not have a testThree associated
		TestThree vrfy4 = c.getProperty(TestSix.oneToOneTestThree);
		assertNull(vrfy4);
	}

	public void testOneToMany() throws Exception {
		
		final TestSix testSix1     = createTestNode(TestSix.class);
		final TestSix testSix2     = createTestNode(TestSix.class);
		final TestThree testThree1 = createTestNode(TestThree.class);
		final TestThree testThree2 = createTestNode(TestThree.class);
				
		try {

			app.beginTx();
			testSix1.setProperty(AbstractNode.name, "a");
			testSix2.setProperty(AbstractNode.name, "c");
			testThree1.setProperty(AbstractNode.name, "b");
			testThree2.setProperty(AbstractNode.name, "d");
			app.commitTx();
			
		} catch (FrameworkException fex) {
		
			fex.printStackTrace();
			
			fail("Unable to create test nodes");

		} finally {

			app.finishTx();
		}

		assertNotNull(testSix1);
		assertNotNull(testThree1);
		assertNotNull(testSix2);
		assertNotNull(testThree2);

		/**
		 * We test the following here:
		 * A -> B
		 * C -> D
		 * 
		 * then connect A -> D, so C and B should not
		 * be related any more
		 */
		try {

			app.beginTx();
			testSix1.setProperty(TestSix.oneToManyTestThrees, toList(testThree1));
			testSix2.setProperty(TestSix.oneToManyTestThrees, toList(testThree2));
			app.commitTx();
			
		} catch (FrameworkException fex) {
		
			fex.printStackTrace();
			
			fail("Unable to link test nodes");

		} finally {

			app.finishTx();
		}
		
		// verify connections
		List<TestThree> verifyB = testSix1.getProperty(TestSix.oneToManyTestThrees);
		List<TestThree> verifyD = testSix2.getProperty(TestSix.oneToManyTestThrees);
		
		assertTrue(verifyB != null && verifyB.get(0).equals(testThree1));
		assertTrue(verifyD != null && verifyD.get(0).equals(testThree2));
		
		try {
			app.beginTx();
			testSix1.setProperty(TestSix.oneToManyTestThrees, toList(testThree2));
			app.commitTx();
			
		} catch (FrameworkException fex) {
		
			fex.printStackTrace();
			
			fail("Unable to link test nodes");

		} finally {

			app.finishTx();
		}

		// verify connection
		List<TestThree> verifyD2 = testSix1.getProperty(TestSix.oneToManyTestThrees);
		assertEquals(1, verifyD2.size());
		assertEquals(testThree2, verifyD2.get(0));
		
		// testSix2 should not have a testThree associated
		List<TestThree> vrfy4 = testSix2.getProperty(TestSix.oneToManyTestThrees);
		assertEquals(0, vrfy4.size());
	}

	/**
	 * Test of typeName method, of class EntityProperty.
	 */
	public void testTypeName() {

		String expResult = "Object";
		String result = TestSix.oneToOneTestThree.typeName();
		assertEquals(expResult, result);
	}

	/**
	 * Test of databaseConverter method, of class EntityProperty.
	 */
	public void testDatabaseConverter() {

		PropertyConverter expResult = null;
		PropertyConverter result = TestSix.oneToOneTestThree.databaseConverter(securityContext, null);
		assertEquals(expResult, result);
	}

	/**
	 * Test of inputConverter method, of class EntityProperty.
	 */
	public void testInputConverter() {

		PropertyConverter result = TestSix.oneToOneTestThree.inputConverter(securityContext);
		
		assertTrue(result != null);
	}

	/**
	 * Test of relatedType method, of class EntityProperty.
	 */
	public void testRelatedType() {

		Class expResult = TestThree.class;
		Class result = TestSix.oneToOneTestThree.relatedType();
		assertEquals(expResult, result);
	}

	/**
	 * Test of isCollection method, of class EntityProperty.
	 */
	public void testIsCollection() {

		boolean expResult = false;
		boolean result = TestSix.oneToOneTestThree.isCollection();
		assertEquals(expResult, result);
	}

}
