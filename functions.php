<?php
/**
 * Theme functions and definitions
 *
 * @package JifTheme
 */

use JifTheme\ErrorHandler;

require_once __DIR__ . '/src/ErrorHandler.php';

new ErrorHandler();

// Autoload dependencies.
if ( file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
}

// Bootstrap the application container.
if ( file_exists( __DIR__ . '/src/bootstrap.php' ) ) {
	require_once __DIR__ . '/src/bootstrap.php';
}
