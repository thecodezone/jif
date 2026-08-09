<?php
/**
 * Comparison Bar block registrar
 *
 * @package JifTheme
 */

namespace JifTheme\Blocks;

use JifTheme\Helpers\Blocks;
use JifTheme\Helpers\Vite;

/**
 * Registers the cz/comparison-bar block.
 */
class ComparisonBar {
	/**
	 * Vite asset loader.
	 *
	 * @var Vite
	 */
	private Vite $vite;

	/**
	 * Constructor.
	 *
	 * @param Vite $vite Vite asset loader.
	 */
	public function __construct( Vite $vite ) {
		$this->vite = $vite;

		add_action( 'init', array( $this, 'register' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_frontend_style' ) );
	}

	/**
	 * Register the block type.
	 */
	public function register(): void {
		$block_dir = get_stylesheet_directory() . '/resources/blocks/comparison-bar';

		if ( ! file_exists( $block_dir . '/block.json' ) ) {
			return;
		}

		// Always use the production build for the editor, regardless of whether the
		// Vite dev server is running — hot-reloading inside the block editor's iframe
		// canvas is unreliable. Dev-server hot reloading is reserved for the frontend
		// (see enqueue_frontend_style()).
		$assets = $this->vite->register_production(
			'resources/blocks/comparison-bar/index.jsx',
			array(
				'handle' => 'cz-comparison-bar',
			)
		);

		$args = array();

		if ( is_array( $assets ) ) {
			if ( ! empty( $assets['scripts'] ) ) {
				$args['editor_script_handles'] = $assets['scripts'];
			}

			if ( ! empty( $assets['styles'] ) ) {
				$args['editor_style_handles'] = $assets['styles'];
			}
		}

		register_block_type( $block_dir, $args );
	}

	/**
	 * Enqueue the block's frontend styles when the block is present on the page.
	 *
	 * Uses a dedicated CSS-only Vite entry rather than the editor script's
	 * registered style handles, since the frontend never loads the editor's
	 * JS bundle at all.
	 */
	public function enqueue_frontend_style(): void {
		if ( ! Blocks::page_has_block( 'cz/comparison-bar' ) ) {
			return;
		}

		$this->vite->enqueue_css(
			'resources/blocks/comparison-bar/frontend.css',
			'cz-comparison-bar-frontend'
		);
	}
}
