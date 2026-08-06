<?php
/**
 * Vite asset loading helper
 *
 * @package JifTheme
 */

namespace JifTheme\Helpers;

use Kucrut\Vite as ViteForWp;

/**
 * Enqueues theme assets built by Vite, with automatic dev/production switching.
 */
class Vite {
	/**
	 * Directory containing the Vite manifest (or dev-server marker) file.
	 *
	 * @var string
	 */
	private string $manifest_dir;

	/**
	 * Constructor.
	 *
	 * @param string $manifest_dir Directory containing the Vite manifest file.
	 */
	public function __construct( string $manifest_dir ) {
		$this->manifest_dir = $manifest_dir;
	}

	/**
	 * Enqueue a Vite entrypoint.
	 *
	 * @param string $entry   Entrypoint path, relative to the theme root (e.g. 'resources/js/app.js').
	 * @param array  $options Options passed through to Kucrut\Vite\enqueue_asset().
	 * @return bool Whether the asset was enqueued successfully.
	 */
	public function enqueue( string $entry, array $options = array() ): bool {
		return ViteForWp\enqueue_asset( $this->manifest_dir, $entry, $options );
	}

	/**
	 * Register (without enqueueing) a Vite entrypoint's scripts/styles.
	 *
	 * Useful for handles that another WordPress API (e.g. register_block_type's
	 * editor_script/editor_style args) will enqueue at the appropriate time.
	 *
	 * @param string $entry   Entrypoint path, relative to the theme root.
	 * @param array  $options Options passed through to Kucrut\Vite\register_asset().
	 * @return array|null Array with 'scripts' and 'styles' handle lists, or null on failure.
	 */
	public function register( string $entry, array $options = array() ): ?array {
		return ViteForWp\register_asset( $this->manifest_dir, $entry, $options );
	}

	/**
	 * Register a Vite entrypoint's built (production) scripts/styles, even
	 * while the Vite dev server is running.
	 *
	 * Useful for contexts like the block editor, where hot-reloading through
	 * an iframe canvas is unreliable — always load the last production build
	 * there, and reserve dev-server hot reloading for the frontend.
	 *
	 * @param string $entry   Entrypoint path, relative to the theme root.
	 * @param array  $options Options passed through to Kucrut\Vite\register_asset().
	 * @return array|null Array with 'scripts' and 'styles' handle lists, or null on failure.
	 */
	public function register_production( string $entry, array $options = array() ): ?array {
		$manifest_path = trailingslashit( $this->manifest_dir ) . 'manifest.json';

		if ( ! is_readable( $manifest_path ) ) {
			return null;
		}

		$manifest = wp_json_file_decode( $manifest_path );

		if ( ! $manifest || ! isset( $manifest->{$entry} ) ) {
			return null;
		}

		$options = wp_parse_args(
			$options,
			array(
				'css-dependencies' => array(),
				'css-media'        => 'all',
				'css-only'         => false,
				'dependencies'     => array(),
				'handle'           => '',
				'in-footer'        => false,
			)
		);

		$url  = content_url( str_replace( wp_normalize_path( WP_CONTENT_DIR ), '', wp_normalize_path( $this->manifest_dir ) ) );
		$item = $manifest->{$entry};

		$assets = array(
			'scripts' => array(),
			'styles'  => array(),
		);

		if ( ! $options['css-only'] ) {
			ViteForWp\filter_script_tag( $options['handle'] );

			// phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
			if ( wp_register_script( $options['handle'], "{$url}/{$item->file}", $options['dependencies'], null, $options['in-footer'] ) ) {
				$assets['scripts'][] = $options['handle'];
			}
		}

		if ( ! empty( $item->css ) ) {
			foreach ( $item->css as $index => $css_file_path ) {
				$style_handle = "{$options['handle']}-{$index}";

				// phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
				if ( wp_register_style( $style_handle, "{$url}/{$css_file_path}", $options['css-dependencies'], null, $options['css-media'] ) ) {
					$assets['styles'][] = $style_handle;
				}
			}
		}

		return $assets;
	}

	/**
	 * Enqueue a Vite entrypoint that is itself a CSS file (not a JS entry with
	 * associated CSS chunks).
	 *
	 * Kucrut\Vite\enqueue_asset()'s `css-only` option only skips registering
	 * the entry as a script — it never registers the entry's own built file
	 * as a style, since that's designed around JS entries whose CSS lives in
	 * a separate `$item->css` list. A pure CSS-only entry's manifest record
	 * has no such list, so `css-only: true` there registers nothing at all
	 * in production. This handles both modes correctly instead.
	 *
	 * @param string $entry  Entrypoint path, relative to the theme root (e.g. 'resources/css/tokens.css').
	 * @param string $handle Style handle to register/enqueue.
	 * @return bool Whether the asset was enqueued successfully.
	 */
	public function enqueue_css( string $entry, string $handle ): bool {
		try {
			$manifest = ViteForWp\get_manifest( $this->manifest_dir );
		} catch ( \Exception $e ) {
			return false;
		}

		if ( ! isset( $manifest->data->{$entry} ) ) {
			return false;
		}

		if ( $manifest->is_dev ) {
			// In dev mode, Vite serves CSS as a JS module that injects a <style> tag
			// when executed — so this must load as a script, not a stylesheet link.
			return (bool) ViteForWp\enqueue_asset( $this->manifest_dir, $entry, array( 'handle' => $handle ) );
		}

		$url  = trailingslashit( ViteForWp\prepare_asset_url( $manifest->dir ) );
		$item = $manifest->data->{$entry};

		// phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
		wp_enqueue_style( $handle, $url . $item->file, array(), null );

		return true;
	}

	/**
	 * Read the built CSS for a Vite CSS entrypoint, for inlining as critical CSS.
	 *
	 * Only available in production (built) mode — while the Vite dev server is
	 * running there is no static file to read, so this returns null and callers
	 * should fall back to enqueue()ing the entry normally.
	 *
	 * @param string $entry Entrypoint path, relative to the theme root (e.g. 'resources/css/critical.css').
	 * @return string|null The built CSS contents, or null if unavailable.
	 */
	public function inline_css( string $entry ): ?string {
		try {
			$manifest = ViteForWp\get_manifest( $this->manifest_dir );
		} catch ( \Exception $e ) {
			return null;
		}

		if ( $manifest->is_dev || ! isset( $manifest->data->{$entry} ) ) {
			return null;
		}

		$file_path = trailingslashit( $manifest->dir ) . $manifest->data->{$entry}->file;

		if ( ! is_readable( $file_path ) ) {
			return null;
		}

		return file_get_contents( $file_path );
	}
}
