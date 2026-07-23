<?php
/**
 * Theme test
 *
 * @package JifTheme
 */

namespace JifTheme\Tests;

use JifTheme\Theme;
use Brain\Monkey\Functions;

/**
 * Theme test class
 */
class ThemeTest extends TestCase {
	/**
	 * Test that the constructor registers hooks and attempts migration.
	 */
	public function test_constructor_registers_hooks() {
		Functions\expect( 'get_stylesheet' )->andReturn( 'child-theme' );
		Functions\expect( 'get_template' )->andReturn( 'parent-theme' );
		$wp_theme = \Mockery::mock( 'WP_Theme' );
		$wp_theme->shouldReceive( 'get_stylesheet' )->andReturn( 'child-theme' );
		Functions\expect( 'wp_get_theme' )->andReturn( $wp_theme );

		Functions\expect( 'get_option' )
			->with( 'jif_theme_mods_migrated' )
			->andReturn( 1 );

		Functions\expect( 'add_action' )
			->once()
			->with( 'after_switch_theme', \Mockery::type( 'array' ) );
		Functions\expect( 'add_action' )
			->once()
			->with( 'wp_enqueue_scripts', \Mockery::type( 'array' ) );

		new Theme();
	}

	/**
	 * Test enqueue_styles method.
	 */
	public function test_enqueue_styles() {
		Functions\expect( 'get_stylesheet' )->andReturn( 'child-theme' );
		Functions\expect( 'get_template' )->andReturn( 'parent-theme' );
		$wp_theme = \Mockery::mock( 'WP_Theme' );
		$wp_theme->shouldReceive( 'get_stylesheet' )->andReturn( 'child-theme' );
		$wp_theme->shouldReceive( 'get' )->with( 'Version' )->andReturn( '1.0.0' );
		Functions\expect( 'wp_get_theme' )->andReturn( $wp_theme );

		Functions\expect( 'get_option' )
			->with( 'jif_theme_mods_migrated' )
			->andReturn( 1 );
		Functions\expect( 'add_action' )->andReturnNull();

		$theme = new Theme();

		Functions\expect( 'get_template_directory_uri' )->once()->andReturn( 'https://example.com/parent' );
		Functions\expect( 'get_stylesheet_directory_uri' )->once()->andReturn( 'https://example.com/child' );

		Functions\expect( 'wp_enqueue_style' )
			->once()
			->with( 'blocksy-style', 'https://example.com/parent/style.css' );

		Functions\expect( 'wp_enqueue_style' )
			->once()
			->with(
				'jif-theme-style',
				'https://example.com/child/style.css',
				array( 'blocksy-style' ),
				'1.0.0'
			);

		$theme->enqueue_styles();
	}

	/**
	 * Test maybe_migrate_mods method.
	 */
	public function test_maybe_migrate_mods() {
		Functions\when( 'get_stylesheet' )->justReturn( 'child-theme' );
		Functions\when( 'get_template' )->justReturn( 'parent-theme' );
		Functions\expect( 'add_action' )->andReturnNull();

		$wp_theme = \Mockery::mock( 'WP_Theme' );
		$wp_theme->shouldReceive( 'get_stylesheet' )->andReturn( 'child-theme' );
		Functions\when( 'wp_get_theme' )->justReturn( $wp_theme );

		// Case: Not migrated, perform migration during instantiation.
		Functions\expect( 'get_option' )
			->once()
			->with( 'jif_theme_mods_migrated' )
			->andReturn( false );

		Functions\expect( 'get_option' )
			->once()
			->with( 'theme_mods_parent-theme' )
			->andReturn( array( 'color' => 'red' ) );

		Functions\expect( 'update_option' )
			->once()
			->with( 'theme_mods_child-theme', array( 'color' => 'red' ) );

		Functions\expect( 'update_option' )
			->once()
			->with( 'jif_theme_mods_migrated', 1 );

		new Theme();
	}

	/**
	 * Test maybe_migrate_mods does nothing when not a child theme.
	 */
	public function test_maybe_migrate_mods_no_child_theme() {
		Functions\when( 'get_stylesheet' )->justReturn( 'parent-theme' );
		Functions\when( 'get_template' )->justReturn( 'parent-theme' );
		Functions\expect( 'add_action' )->andReturnNull();

		$wp_theme = \Mockery::mock( 'WP_Theme' );
		$wp_theme->shouldReceive( 'get_stylesheet' )->andReturn( 'parent-theme' );
		Functions\when( 'wp_get_theme' )->justReturn( $wp_theme );

		Functions\expect( 'get_option' )
			->never()
			->with( 'jif_theme_mods_migrated' );

		Functions\expect( 'update_option' )
			->never()
			->with( 'jif_theme_mods_migrated', 1 );

		new Theme();
	}

	/**
	 * Test maybe_migrate_mods does nothing when current theme does not match stylesheet.
	 */
	public function test_maybe_migrate_mods_mismatched_theme() {
		Functions\when( 'get_stylesheet' )->justReturn( 'child-theme' );
		Functions\when( 'get_template' )->justReturn( 'parent-theme' );
		Functions\expect( 'add_action' )->andReturnNull();

		$wp_theme = \Mockery::mock( 'WP_Theme' );
		$wp_theme->shouldReceive( 'get_stylesheet' )->andReturn( 'other-theme' );
		Functions\when( 'wp_get_theme' )->justReturn( $wp_theme );

		Functions\expect( 'get_option' )
			->never()
			->with( 'jif_theme_mods_migrated' );

		new Theme();
	}

	/**
	 * Test maybe_migrate_mods does nothing if already migrated.
	 */
	public function test_maybe_migrate_mods_already_migrated() {
		Functions\when( 'get_stylesheet' )->justReturn( 'child-theme' );
		Functions\when( 'get_template' )->justReturn( 'parent-theme' );
		Functions\expect( 'add_action' )->andReturnNull();

		$wp_theme = \Mockery::mock( 'WP_Theme' );
		$wp_theme->shouldReceive( 'get_stylesheet' )->andReturn( 'child-theme' );
		Functions\when( 'wp_get_theme' )->justReturn( $wp_theme );

		Functions\expect( 'get_option' )
			->once()
			->with( 'jif_theme_mods_migrated' )
			->andReturn( 1 );

		Functions\expect( 'get_option' )
			->never()
			->with( 'theme_mods_parent-theme' );

		new Theme();
	}

	/**
	 * Test maybe_migrate_mods when parent mods do not exist.
	 * Even if parent mods do not exist, the flag should be set and child mods updated with false.
	 */
	public function test_maybe_migrate_mods_no_parent_mods() {
		Functions\when( 'get_stylesheet' )->justReturn( 'child-theme' );
		Functions\when( 'get_template' )->justReturn( 'parent-theme' );
		Functions\expect( 'add_action' )->andReturnNull();

		$wp_theme = \Mockery::mock( 'WP_Theme' );
		$wp_theme->shouldReceive( 'get_stylesheet' )->andReturn( 'child-theme' );
		Functions\when( 'wp_get_theme' )->justReturn( $wp_theme );

		Functions\expect( 'get_option' )
			->once()
			->with( 'jif_theme_mods_migrated' )
			->andReturn( false );

		Functions\expect( 'get_option' )
			->once()
			->with( 'theme_mods_parent-theme' )
			->andReturn( false );

		Functions\expect( 'update_option' )
			->once()
			->with( 'theme_mods_child-theme', false );

		Functions\expect( 'update_option' )
			->once()
			->with( 'jif_theme_mods_migrated', 1 );

		new Theme();
	}
}
