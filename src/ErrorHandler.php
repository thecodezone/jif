<?php
/**
 * Error Handler
 *
 * Handles custom error management, specifically for suppressing certain deprecation warnings.
 *
 * @package JifTheme
 */

namespace JifTheme;

/**
 * Class ErrorHandler
 *
 * Handles custom error management, specifically for suppressing certain deprecation warnings.
 */
class ErrorHandler {
	/**
	 * List of paths/strings to ignore deprecation warnings for.
	 *
	 * @var array
	 */
	protected array $blacklist = array(
		'is_file(): Passing null to parameter',
		// WordPress doing_it_wrong / incorrect usage notices we want to suppress.
		'Function WP_Scripts::add was called incorrectly',
		'enqueued with dependencies that are not registered',
		'elementor-v2-editor-components',
		'preg_replace(): Passing null',
	);

	/**
	 * Previous error handler.
	 *
	 * @var callable|null
	 */
	protected $previous_handler = null;

	/**
	 * Add a string to the blacklist.
	 *
	 * @param string $error_string String to add to blacklist.
	 * @return void
	 */
	public function add_to_blacklist( string $error_string ): void {
		$this->blacklist[] = $error_string;
	}

	/**
	 * Get the previous error handler.
	 *
	 * @return callable|null Previous error handler if exists.
	 */
	public function get_previous_error_handler(): ?callable {
		return $this->previous_handler;
	}

	/**
	 * Check if a string is in the blacklist.
	 *
	 * @param string $error_string String to check.
	 * @return bool True if blacklisted, false otherwise.
	 */
	public function is_blacklisted( string $error_string ): bool {
		foreach ( $this->blacklist as $blacklisted ) {
			if ( false !== strpos( $error_string, $blacklisted ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Constructor.
	 *
	 * Sets up the custom error handler.
	 */
	public function __construct() {
		$this->previous_handler = set_error_handler( array( $this, 'handle' ) );
	}

	/**
	 * Custom error handler.
	 *
	 * @param int    $errno   Error number.
	 * @param string $errstr  Error string.
	 * @param string $errfile File where the error occurred.
	 * @param int    $errline Line where the error occurred.
	 * @return bool True if error handled, false otherwise.
	 */
	public function handle( int $errno, string $errstr, string $errfile, int $errline ): bool {
		// Only handle deprecation warnings and selected notices (blacklisted messages).
		if ( in_array( $errno, array( E_DEPRECATED, E_USER_DEPRECATED, E_NOTICE, E_USER_NOTICE ), true ) ) {
			foreach ( $this->blacklist as $blacklisted_string ) {
				if (
					false !== strpos( $errstr, $blacklisted_string ) ||
					false !== strpos( $errfile, $blacklisted_string )
				) {
					// Ignore this deprecation warning.
					return true;
				}
			}

			// If running in PHPUnit, suppress callstack and just print message.
			if ( '1' === getenv( 'PHPUNIT' ) ) {
				fwrite( STDERR, "Deprecation Notice: $errstr in $errfile on line $errline\n" );
				return true;
			}
		}

		// If we have a previous error handler, call it.
		if ( $this->previous_handler ) {
			return call_user_func(
				$this->previous_handler,
				$errno,
				$errstr,
				$errfile,
				$errline
			);
		}

		// Let default PHP error handler handle it.
		return false;
	}

	/**
	 * Reset to the previous error handler.
	 *
	 * @return void
	 */
	public function restore(): void {
		if ( $this->previous_handler ) {
			restore_error_handler();
		}
	}
}
