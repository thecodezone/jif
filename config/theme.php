<?php
/**
 * Theme configuration
 *
 * @package JifTheme
 */

return array(
	'providers' => array(
		JifTheme\ServiceProviders\ACFServiceProvider::class,
		JifTheme\ServiceProviders\ViteServiceProvider::class,
		JifTheme\ServiceProviders\BlockServiceProvider::class,
		JifTheme\ServiceProviders\ThemeServiceProvider::class,
	),
);
