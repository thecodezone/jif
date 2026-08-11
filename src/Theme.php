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
		add_action( 'wp_head', array( $this, 'inline_critical_css' ), 1 );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_editor_styles' ) );

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
				'frame' => get_stylesheet_directory_uri() . '/assets/brand-ring.svg',
			)
		);

		// While the Vite dev server is running there's no built file to inline, so
		// fall back to enqueueing the critical CSS entry as a normal stylesheet.
		if ( null === $this->vite->inline_css( 'resources/css/critical.css' ) ) {
			$this->vite->enqueue(
				'resources/css/critical.css',
				array( 'handle' => 'jif-theme-critical' )
			);
		}
	}

	/**
	 * Enqueue theme design tokens (CSS variables) in the block editor.
	 *
	 * Blocks rely on --font-serif, --cz-cb-icon-color, etc. as fallbacks, so
	 * those need to be available while editing, not just on the frontend.
	 * Hooked on enqueue_block_assets (not enqueue_block_editor_assets) so it
	 * loads inside the editor's iframe canvas, where blocks actually render —
	 * enqueue_block_editor_assets only reaches the outer admin document.
	 * Skipped on the frontend since app.css already imports tokens.css there.
	 */
	public function enqueue_editor_styles(): void {
		if ( ! is_admin() ) {
			return;
		}

		$this->vite->enqueue_css( 'resources/css/tokens.css', 'jif-theme-tokens' );
	}

	/**
	 * Inline the built critical CSS directly in <head>.
	 *
	 * No-op while the Vite dev server is running, since enqueue_styles()
	 * already falls back to a normal stylesheet enqueue in that case.
	 */
	public function inline_critical_css(): void {
		$css = $this->vite->inline_css( 'resources/css/critical.css' );

		if ( null === $css ) {
			return;
		}

		echo '<style id="jif-theme-critical-css">' . $css . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
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
