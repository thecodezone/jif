<?php
/**
 * ACF Service Provider
 *
 * @package JifTheme
 */

namespace JifTheme\ServiceProviders;

use CodeZone\WPSupport\Config\ConfigInterface;
use League\Container\ServiceProvider\AbstractServiceProvider;
use League\Container\ServiceProvider\BootableServiceProviderInterface;
use JifTheme\ACF\PostTypeRegistrar;

/**
 * Service provider for ACF configuration.
 */
class ACFServiceProvider extends AbstractServiceProvider implements BootableServiceProviderInterface {
	/**
	 * Determines whether the given identifier is provided by this service.
	 *
	 * @param string $id The identifier to check.
	 * @return bool Returns true if the identifier is provided, otherwise false.
	 */
	public function provides( string $id ): bool {
		return in_array(
			$id,
			array(
				PostTypeRegistrar::class,
			),
			true
		);
	}

	/**
	 * Register services with the container.
	 */
	public function register(): void {
	}

	/**
	 * Boot the service provider.
	 */
	public function boot(): void {
		// Register the post type registrar.
		$this->getContainer()->addShared(
			PostTypeRegistrar::class,
			function () {
				return new PostTypeRegistrar(
					$this->getContainer()->get( ConfigInterface::class )
				);
			}
		);

		// Instantiate the services (self-register their hooks).
		$this->getContainer()->get( PostTypeRegistrar::class );
	}
}
