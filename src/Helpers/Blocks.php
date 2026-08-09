<?php
/**
 * Block detection helpers
 *
 * @package JifTheme
 */

namespace JifTheme\Helpers;

/**
 * Helpers for detecting block usage on the current page.
 */
class Blocks {
	/**
	 * Like has_block(), but also finds instances nested inside a reusable
	 * block (`wp:block {"ref":ID}`) — has_block() only pattern-matches the
	 * given post's literal content, so a block that only appears inside a
	 * reusable block referenced from the page is otherwise invisible to it.
	 *
	 * @param string $block_name Block name to look for, e.g. 'cz/featured-stories'.
	 * @return bool
	 */
	public static function page_has_block( string $block_name ): bool {
		$post = get_post();

		if ( ! $post ) {
			return false;
		}

		return self::content_has_block( $post->post_content, $block_name, array() );
	}

	/**
	 * Recursively search post content for a block, expanding any reusable
	 * block (`core/block`) references it contains.
	 *
	 * @param string $content    Block markup to search.
	 * @param string $block_name Block name to look for.
	 * @param array  $seen_refs  Reusable block post IDs already expanded, to guard against reference cycles.
	 * @return bool
	 */
	private static function content_has_block( string $content, string $block_name, array $seen_refs ): bool {
		if ( has_block( $block_name, $content ) ) {
			return true;
		}

		foreach ( parse_blocks( $content ) as $block ) {
			if ( 'core/block' !== $block['blockName'] || empty( $block['attrs']['ref'] ) ) {
				continue;
			}

			$ref = (int) $block['attrs']['ref'];

			if ( in_array( $ref, $seen_refs, true ) ) {
				continue;
			}

			$reusable = get_post( $ref );

			if ( ! $reusable || empty( $reusable->post_content ) ) {
				continue;
			}

			if ( self::content_has_block( $reusable->post_content, $block_name, array_merge( $seen_refs, array( $ref ) ) ) ) {
				return true;
			}
		}

		return false;
	}
}
