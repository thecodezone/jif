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
}
