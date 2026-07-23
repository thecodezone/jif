<?php
/**
 * Post Type Registrar
 *
 * @package JifTheme
 */

namespace JifTheme\ACF;

use CodeZone\WPSupport\Config\ConfigInterface;

/**
 * Service class for registering post types.
 */
class PostTypeRegistrar {
	/**
	 * Config interface.
	 *
	 * @var ConfigInterface
	 */
	protected ConfigInterface $config;

	/**
	 * Constructor.
	 *
	 * @param ConfigInterface $config Config interface.
	 */
	public function __construct( ConfigInterface $config ) {
		$this->config = $config;

		$this->register_hooks();
	}

	/**
	 * Register WordPress hooks.
	 */
	protected function register_hooks(): void {
		add_action( 'init', array( $this, 'register_post_types' ), 5 );
	}

	/**
	 * Register custom post types.
	 */
	public function register_post_types(): void {
		$post_types = $this->config->get( 'post-types', array() );

		foreach ( $post_types as $key => $args ) {
			register_post_type( $key, $args );
		}
	}
}
