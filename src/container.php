<?php
/**
 * Container helper functions
 *
 * @package JifTheme
 */

use CodeZone\WPSupport\Config\ConfigInterface;
use CodeZone\WPSupport\Container\ContainerFactory;
use League\Container\Container;
use League\Container\ServiceProvider\BootableServiceProviderInterface;
use JifTheme\ServiceProviders\ConfigServiceProvider;

/**
 * Initialize and return the application container.
 *
 * @return Container
 */
function jif_theme_container(): Container {
	static $container = null;

	if ( null === $container ) {
		// Use ContainerFactory from wp-support to create container with auto-wiring.
		$container = ContainerFactory::singleton();

		// Service providers to register (order matters - ConfigServiceProvider must be first).
		$boot_providers = array(
			ConfigServiceProvider::class,
		);

		// Register and boot service providers.
		foreach ( $boot_providers as $provider ) {
			$provider_instance = $container->get( $provider );
			$container->addServiceProvider( $provider_instance );
			// Explicitly boot the provider if it's bootable.
			if ( $provider_instance instanceof BootableServiceProviderInterface ) {
				$provider_instance->boot();
			}
		}

		$config    = $container->get( ConfigInterface::class );
		$providers = $config->get( 'theme.providers', array() );
		foreach ( $providers as $provider ) {
			$provider_instance = $container->get( $provider );
			$container->addServiceProvider( $provider_instance );
			// Explicitly boot the provider if it's bootable.
			if ( $provider_instance instanceof BootableServiceProviderInterface ) {
				$provider_instance->boot();
			}
		}
	}//end if

	return $container;
}

/**
 * Get a service from the container.
 *
 * @param string $id Service identifier.
 * @return mixed
 */
function jif_theme_get( string $id ) {
	return jif_theme_container()->get( $id );
}

/**
 * Check if a service exists in the container.
 *
 * @param string $id Service identifier.
 * @return bool
 */
function jif_theme_has( string $id ): bool {
	return jif_theme_container()->has( $id );
}
