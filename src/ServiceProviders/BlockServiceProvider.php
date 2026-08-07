<?php
/**
 * Block Service Provider
 *
 * @package JifTheme
 */

namespace JifTheme\ServiceProviders;

use JifTheme\Blocks\ComparisonBar;
use JifTheme\Blocks\FeaturedStories;
use JifTheme\Helpers\Vite;
use League\Container\ServiceProvider\AbstractServiceProvider;
use League\Container\ServiceProvider\BootableServiceProviderInterface;

/**
 * Service provider for custom block registration.
 */
class BlockServiceProvider extends AbstractServiceProvider implements BootableServiceProviderInterface {
	/**
	 * Determines whether the given identifier is provided by this service.
	 *
	 * @param string $id The identifier to check.
	 * @return bool Returns true if the identifier is provided, otherwise false.
	 */
	public function provides( string $id ): bool {
		return in_array( $id, array( ComparisonBar::class, FeaturedStories::class ), true );
	}

	/**
	 * Register services with the container.
	 */
	public function register(): void {
		$this->getContainer()->add( ComparisonBar::class )
			->addArgument( Vite::class )
			->setShared( true );

		$this->getContainer()->add( FeaturedStories::class )
			->addArgument( Vite::class )
			->setShared( true );
	}

	/**
	 * Boot the service provider.
	 */
	public function boot(): void {
		$this->getContainer()->get( ComparisonBar::class );
		$this->getContainer()->get( FeaturedStories::class );
	}
}
