<?php
/**
 * Theme service class
 *
 * @package JifTheme
 */

namespace JifTheme;

use JifTheme\Helpers\Vite;

/**
 * Service class for Theme logic.
 */
class Theme {
	/**
	 * Vite asset loader.
	 *
	 * @var Vite
	 */
	private Vite $vite;

	/**
	 * Constructor.
	 *
	 * Registers WordPress hooks.
	 *
	 * @param Vite $vite Vite asset loader.
	 */
	public function __construct( Vite $vite ) {
		$this->vite = $vite;

		add_action( 'after_switch_theme', array( $this, 'maybe_migrate_mods' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ) );

		// Also run it on instantiation if not already done, in case the theme was already active.
		$this->maybe_migrate_mods();
	}

	/**
	 * Enqueue theme styles and scripts.
	 */
	public function enqueue_styles(): void {
		$theme   = wp_get_theme();
		$version = $theme->get( 'Version' );

		wp_enqueue_style( 'blocksy-style', get_template_directory_uri() . '/style.css' );
		wp_enqueue_style(
			'jif-theme-style',
			get_stylesheet_directory_uri() . '/style.css',
			array( 'blocksy-style' ),
			$version
		);

		$this->vite->enqueue(
			'resources/js/app.js',
			array(
				'handle'    => 'jif-theme',
				'in-footer' => true,
			)
		);

		wp_localize_script(
			'jif-theme',
			'jifBrandFrame',
			array(
				'left'  => get_stylesheet_directory_uri() . '/assets/left-color.svg',
				'right' => get_stylesheet_directory_uri() . '/assets/right-color.svg',
			)
		);
	}

	/**
	 * Migrate theme mods from the parent theme if not already done.
	 *
	 * @return void
	 */
	public function maybe_migrate_mods(): void {
		$stylesheet    = get_stylesheet();
		$template      = get_template();
		$current_theme = wp_get_theme()->get_stylesheet();

		if ( $stylesheet !== $current_theme ) {
			return;
		}

		if ( $stylesheet === $template ) {
			return;
		}

		if ( get_option( 'jif_theme_mods_migrated' ) ) {
			return;
		}

		$parent_mods = get_option( "theme_mods_$template" );

		update_option( "theme_mods_$stylesheet", $parent_mods );

		update_option( 'jif_theme_mods_migrated', 1 );
	}
}
