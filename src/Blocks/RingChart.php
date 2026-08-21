<?php
/**
 * Ring Chart block registrar
 *
 * @package JifTheme
 */

namespace JifTheme\Blocks;

use JifTheme\Helpers\Blocks;
use JifTheme\Helpers\Vite;

/**
 * Registers the cz/ring-chart block.
 */
class RingChart {
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
		$block_dir = get_stylesheet_directory() . '/resources/blocks/ring-chart';

		if ( ! file_exists( $block_dir . '/block.json' ) ) {
			return;
		}

		// Always use the production build for the editor, regardless of whether the
		// Vite dev server is running — hot-reloading inside the block editor's iframe
		// canvas is unreliable. Dev-server hot reloading is reserved for the frontend
		// (see enqueue_frontend_style()).
		$assets = $this->vite->register_production(
			'resources/blocks/ring-chart/index.jsx',
			array(
				'handle' => 'cz-ring-chart',
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
	 * Enqueue the block's frontend styles and script when the block is
	 * present on the page.
	 *
	 * Uses dedicated Vite entries rather than the editor script's registered
	 * handles, since the frontend never loads the editor's JS bundle at all.
	 * The script nudges each ring's label down to sit on the ring's arc as
	 * it actually runs under the label's width (see frontend.js) — CSS alone
	 * can't do this because it depends on the label's rendered pixel width.
	 */
	public function enqueue_frontend_style(): void {
		if ( ! Blocks::page_has_block( 'cz/ring-chart' ) ) {
			return;
		}

		$this->vite->enqueue_css(
			'resources/blocks/ring-chart/frontend.css',
			'cz-ring-chart-frontend'
		);

		$this->vite->enqueue(
			'resources/blocks/ring-chart/frontend.js',
			array( 'handle' => 'cz-ring-chart-frontend-js' )
		);
	}
}
