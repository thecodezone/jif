<?php
/**
 * Theme Service Provider
 *
 * @package JifTheme
 */

namespace JifTheme\ServiceProviders;

use JifTheme\Theme;
use League\Container\ServiceProvider\AbstractServiceProvider;
use League\Container\ServiceProvider\BootableServiceProviderInterface;

/**
 * Service provider for Theme configuration and hooks.
 */
class ThemeServiceProvider extends AbstractServiceProvider implements BootableServiceProviderInterface {
	/**
	 * Determines whether the given identifier is provided by this service.
	 *
	 * @param string $id The identifier to check.
	 * @return bool Returns true if the identifier is provided, otherwise false.
	 */
	public function provides( string $id ): bool {
		return in_array( $id, array( Theme::class ), true );
	}

	/**
	 * Register services with the container.
	 */
	public function register(): void {
		$this->getContainer()->add( Theme::class )->setShared( true );
	}

	/**
	 * Boot the service provider.
	 */
	public function boot(): void {
		$this->getContainer()->get( Theme::class );
	}
}
