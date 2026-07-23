<?php
/**
 * ThemeServiceProvider test
 *
 * @package JifTheme
 */

namespace JifTheme\Tests;

use JifTheme\ServiceProviders\ThemeServiceProvider;
use JifTheme\Theme;
use League\Container\Container;
use Brain\Monkey\Functions;

/**
 * ThemeServiceProvider test class
 */
class ThemeServiceProviderTest extends TestCase {
	/**
	 * Test provides method.
	 */
	public function test_provides() {
		$provider = new ThemeServiceProvider();
		$this->assertTrue( $provider->provides( Theme::class ) );
		$this->assertFalse( $provider->provides( 'NonExistent' ) );
	}

	/**
	 * Test register method.
	 */
	public function test_register() {
		$container = new Container();
		$provider  = new ThemeServiceProvider();
		$provider->setContainer( $container );

		$provider->register();

		$this->assertTrue( $container->has( Theme::class ) );
	}

	/**
	 * Test boot method.
	 */
	public function test_boot() {
		$container = \Mockery::mock( Container::class );
		$container->shouldReceive( 'get' )->with( Theme::class )->once();

		$provider = new ThemeServiceProvider();
		$provider->setContainer( $container );

		$provider->boot();
	}
}
