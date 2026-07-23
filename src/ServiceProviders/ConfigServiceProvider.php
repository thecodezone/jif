<?php
/**
 * Config Service Provider
 *
 * @package JifTheme
 */

namespace JifTheme\ServiceProviders;

use CodeZone\WPSupport\Config\Config;
use CodeZone\WPSupport\Config\ConfigInterface;
use League\Container\ServiceProvider\AbstractServiceProvider;
use League\Container\ServiceProvider\BootableServiceProviderInterface;

/**
 * Service provider for configuration management.
 */
class ConfigServiceProvider extends AbstractServiceProvider implements BootableServiceProviderInterface {
	/**
	 * Determines whether the given identifier is provided by this service.
	 *
	 * @param string $id The identifier to check.
	 * @return bool Returns true if the identifier is provided, otherwise false.
	 */
	public function provides( string $id ): bool {
		return ConfigInterface::class === $id;
	}

	/**
	 * Boot the service provider.
	 *
	 * Loads all configuration files from the config directory.
	 */
	public function boot(): void {
		$this->getContainer()->addShared(
			ConfigInterface::class,
			function () {
				return new Config();
			}
		);
		$config = $this->getContainer()->get( ConfigInterface::class );
		$this->load_config_files( $config );
	}

	/**
	 * Register services with the container.
	 */
	public function register(): void {
		// Register the shared Config instance.
	}

	/**
	 * Load all configuration files from the config directory.
	 *
	 * @param Config $config The config instance.
	 */
	private function load_config_files( Config $config ): void {
		$config_dir = get_stylesheet_directory() . '/config';

		if ( ! is_dir( $config_dir ) ) {
			return;
		}

		$config_files = glob( $config_dir . '/*.php' );

		if ( empty( $config_files ) ) {
			return;
		}

		foreach ( $config_files as $file ) {
			$name = basename( $file, '.php' );
			$data = require $file;

			if ( ! is_array( $data ) ) {
				continue;
			}

			$config->merge( array( $name => $data ) );
		}
	}
}
