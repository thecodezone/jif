<?php
/**
 * Test case for Jif Child Theme
 *
 * @package JifTheme
 */

namespace JifTheme\Tests;

use PHPUnit\Framework\TestCase as PHPUnitTestCase;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use Brain\Monkey;

/**
 * Base test case class
 */
class TestCase extends PHPUnitTestCase {

	// Adds Mockery expectations to the PHPUnit assertions count.
	use MockeryPHPUnitIntegration;

	/**
	 * Set up tests
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
	}

	/**
	 * Tear down tests
	 */
	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}
}
