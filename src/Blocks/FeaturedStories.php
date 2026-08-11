<?php
/**
 * Featured Stories block registrar
 *
 * @package JifTheme
 */

namespace JifTheme\Blocks;

use JifTheme\Helpers\Blocks;
use JifTheme\Helpers\Vite;

/**
 * Registers the cz/featured-stories block.
 */
class FeaturedStories {
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
		$block_dir = get_stylesheet_directory() . '/resources/blocks/featured-stories';

		if ( ! file_exists( $block_dir . '/block.json' ) ) {
			return;
		}

		// Always use the production build for the editor, regardless of whether the
		// Vite dev server is running — hot-reloading inside the block editor's iframe
		// canvas is unreliable. Dev-server hot reloading is reserved for the frontend
		// (see enqueue_frontend_style()).
		$assets = $this->vite->register_production(
			'resources/blocks/featured-stories/index.jsx',
			array(
				'handle'       => 'cz-featured-stories',
				'dependencies' => array( 'wp-server-side-render' ),
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
		if ( ! Blocks::page_has_block( 'cz/featured-stories' ) ) {
			return;
		}

		$this->vite->enqueue_css(
			'resources/blocks/featured-stories/frontend.css',
			'cz-featured-stories-frontend'
		);
	}

	/**
	 * Build the WP_Query used to fetch the block's featured posts.
	 *
	 * @param array $attributes Block attributes.
	 * @return WP_Query
	 */
	public static function build_query( array $attributes ): \WP_Query {
		$posts_to_show = max( 1, (int) ( $attributes['postsToShow'] ?? 3 ) );
		$category_id   = (int) ( $attributes['categoryId'] ?? 0 );
		$order         = ( $attributes['order'] ?? 'desc' ) === 'asc' ? 'ASC' : 'DESC';
		$order_by      = $attributes['orderBy'] ?? 'date';

		$allowed_orderby = array( 'date', 'title', 'rand', 'modified' );
		if ( ! in_array( $order_by, $allowed_orderby, true ) ) {
			$order_by = 'date';
		}

		$query_args = array(
			'post_type'           => 'post',
			'post_status'         => 'publish',
			'posts_per_page'      => $posts_to_show,
			'orderby'             => $order_by,
			'order'               => $order,
			'ignore_sticky_posts' => true,
			'no_found_rows'       => true,
		);

		if ( $category_id > 0 ) {
			$query_args['cat'] = $category_id;
		}

		return new \WP_Query( $query_args );
	}

	/**
	 * Estimate a post's reading time in whole minutes (min. 1).
	 *
	 * @return int
	 */
	public static function reading_time_minutes(): int {
		$word_count = count( preg_split( '/\s+/', wp_strip_all_tags( get_the_content() ) ) );

		return max( 1, (int) ceil( $word_count / 200 ) );
	}

	/**
	 * Build the inline `--cz-fs-*` custom property declarations for a block
	 * instance from its attributes.
	 *
	 * Mirrors comparison-bar's style-vars.js — responsive attributes
	 * ({ desktop, tablet, mobile }) map to three variables each; style.css
	 * switches between them at the matching breakpoints. PHP is the single
	 * render path here (frontend + editor ServerSideRender both go through
	 * render.php), so the mapping lives once, in PHP, rather than being
	 * duplicated in JS.
	 *
	 * @param array $attributes Block attributes.
	 * @return string CSS custom property declarations, e.g. "--cz-fs-x:1px;--cz-fs-y:2px;".
	 */
	public static function build_style_vars( array $attributes ): string {
		$vars = array(
			'--cz-fs-title-font-family'  => $attributes['titleFontFamily'] ?? 'var(--font-serif)',
			'--cz-fs-body-font-family'   => $attributes['bodyFontFamily'] ?? 'var(--font-serif)',
			'--cz-fs-ui-font-family'     => $attributes['uiFontFamily'] ?? 'var(--theme-font-family)',
			'--cz-fs-card-padding'       => ( $attributes['cardPadding'] ?? 24 ) . 'px',
			'--cz-fs-image-aspect-ratio' => $attributes['imageAspectRatio'] ?? '16 / 10',
			'--cz-fs-border-width'       => ( $attributes['borderWidth'] ?? 1 ) . 'px',
			'--cz-fs-border-radius'      => ( $attributes['borderRadius'] ?? 12 ) . 'px',
			'--cz-fs-title-weight'       => $attributes['titleFontWeight'] ?? '700',
			'--cz-fs-badge-size'         => ( $attributes['badgeFontSize'] ?? 13 ) . 'px',
			'--cz-fs-background'         => $attributes['backgroundColor'] ?? '#ffffff',
			'--cz-fs-border-color'       => $attributes['borderColor'] ?? '#e2e5f1',
			'--cz-fs-media-bg'           => $attributes['mediaBackgroundColor'] ?? '#dde5ff',
			'--cz-fs-media-icon'         => $attributes['mediaIconColor'] ?? '#9db4f0',
			'--cz-fs-badge-bg'           => $attributes['badgeBackgroundColor'] ?? 'var(--theme-palette-color-1, #0c1488)',
			'--cz-fs-badge-text'         => $attributes['badgeTextColor'] ?? '#ffffff',
			'--cz-fs-title-color'        => $attributes['titleColor'] ?? '#0e1226',
			'--cz-fs-excerpt-color'      => $attributes['excerptColor'] ?? '#282f4c',
			'--cz-fs-meta-color'         => $attributes['metaColor'] ?? '#6d7497',
			'--cz-fs-link-color'         => $attributes['linkColor'] ?? 'var(--theme-palette-color-1, #0c1488)',
			'--cz-fs-link-hover-color'   => $attributes['linkHoverColor'] ?? 'var(--theme-palette-color-2, #c6a532)',
			'--cz-fs-shadow'             => $attributes['shadow'] ?? '0 2px 6px rgba(12, 20, 136, 0.07)',
			'--cz-fs-shadow-hover'       => $attributes['shadowHover'] ?? '0 8px 20px rgba(12, 20, 136, 0.09)',
		);

		self::add_responsive_vars( $vars, '--cz-fs-min-card-width', $attributes['minCardWidth'] ?? array() );
		self::add_responsive_vars( $vars, '--cz-fs-grid-gap', $attributes['gridGap'] ?? array() );
		self::add_responsive_vars( $vars, '--cz-fs-title-size', $attributes['titleFontSize'] ?? array() );
		self::add_responsive_vars( $vars, '--cz-fs-excerpt-size', $attributes['excerptFontSize'] ?? array() );
		self::add_responsive_vars( $vars, '--cz-fs-meta-size', $attributes['metaFontSize'] ?? array() );

		$declarations = '';

		foreach ( $vars as $name => $value ) {
			$declarations .= sprintf( '%s:%s;', $name, $value );
		}

		return $declarations;
	}

	/**
	 * Add the three per-device variables for a responsive attribute, cascading
	 * an unset device down from the one above it (tablet falls back to
	 * desktop, mobile falls back to tablet) and omitting any device that is
	 * still unset once cascaded, so the block's own CSS fallback/inheritance
	 * applies instead of forcing a value. Mirrors comparison-bar's
	 * style-vars.js addResponsiveVars().
	 *
	 * @param array  $vars  Vars array to mutate.
	 * @param string $name  CSS variable base name (without the -desktop/-tablet/-mobile suffix).
	 * @param array  $value Responsive attribute value ({ desktop, tablet, mobile }).
	 */
	private static function add_responsive_vars( array &$vars, string $name, array $value ): void {
		$desktop = $value['desktop'] ?? null;
		$tablet  = $value['tablet'] ?? $desktop;
		$mobile  = $value['mobile'] ?? $tablet;

		$resolved = array(
			'desktop' => $desktop,
			'tablet'  => $tablet,
			'mobile'  => $mobile,
		);

		foreach ( $resolved as $device => $device_value ) {
			if ( null !== $device_value ) {
				$vars[ "{$name}-{$device}" ] = is_numeric( $device_value ) ? $device_value . 'px' : $device_value;
			}
		}
	}
}
