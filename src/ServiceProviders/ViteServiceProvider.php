<?php
/**
 * Vite Service Provider
 *
 * @package JifTheme
 */

namespace JifTheme\ServiceProviders;

use JifTheme\Helpers\Vite;
use League\Container\ServiceProvider\AbstractServiceProvider;
use League\Container\ServiceProvider\BootableServiceProviderInterface;

/**
 * Service provider for Vite asset loading.
 */
class ViteServiceProvider extends AbstractServiceProvider implements BootableServiceProviderInterface {
	/**
	 * Determines whether the given identifier is provided by this service.
	 *
	 * @param string $id The identifier to check.
	 * @return bool Returns true if the identifier is provided, otherwise false.
	 */
	public function provides( string $id ): bool {
		return in_array( $id, array( Vite::class ), true );
	}

	/**
	 * Register services with the container.
	 */
	public function register(): void {
		$this->getContainer()->addShared(
			Vite::class,
			function () {
				return new Vite( get_stylesheet_directory() . '/assets/build' );
			}
		);
	}

	/**
	 * Boot the service provider.
	 */
	public function boot(): void {
	}
}
