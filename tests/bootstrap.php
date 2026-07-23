<?php
/**
 * PHPUnit bootstrap file
 *
 * @package JifTheme
 */

// Load Composer autoloader.
require_once __DIR__ . '/../vendor/autoload.php';

// Mock WP_Error class for tests if not already loaded.
if ( ! class_exists( 'WP_Error' ) ) {
	// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedClassFound
	/**
	 * Mock WP_Error class
	 */
	class WP_Error {
	// phpcs:enable
		/**
		 * Errors array
		 *
		 * @var array
		 */
		protected $errors = array();
		/**
		 * Error data array
		 *
		 * @var array
		 */
		protected $error_data = array();

		/**
		 * Constructor
		 *
		 * @param string $code Error code.
		 * @param string $message Error message.
		 * @param mixed  $data Error data.
		 */
		public function __construct( $code = '', $message = '', $data = '' ) {
			if ( empty( $code ) ) {
				return;
			}
			$this->errors[ $code ][] = $message;
			if ( ! empty( $data ) ) {
				$this->error_data[ $code ] = $data;
			}
		}

		/**
		 * Get error message
		 *
		 * @param string $code Error code.
		 */
		public function get_error_message( $code = '' ) {
			if ( empty( $code ) ) {
				$code = $this->get_error_code();
			}
			$messages = $this->get_error_messages( $code );
			if ( empty( $messages ) ) {
				return '';
			}
			return $messages[0];
		}

		/**
		 * Get error code
		 */
		public function get_error_code() {
			$codes = $this->get_error_codes();
			if ( empty( $codes ) ) {
				return '';
			}
			return $codes[0];
		}

		/**
		 * Get error codes
		 */
		public function get_error_codes() {
			if ( empty( $this->errors ) ) {
				return array();
			}
			return array_keys( $this->errors );
		}

		/**
		 * Get error messages
		 *
		 * @param string $code Error code.
		 */
		public function get_error_messages( $code = '' ) {
			if ( empty( $code ) ) {
				$all_messages = array();
				foreach ( (array) $this->errors as $m_code => $messages ) {
					$all_messages = array_merge( $all_messages, $messages );
				}
				return $all_messages;
			}
			if ( isset( $this->errors[ $code ] ) ) {
				return $this->errors[ $code ];
			}
			return array();
		}
	}
}
