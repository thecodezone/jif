<?php
/**
 * Featured Stories (Post Cards) block render.
 *
 * @package JifTheme
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

use JifTheme\Blocks\FeaturedStories;

( function ( array $attributes ) {
	$excerpt_length = max( 1, (int) ( $attributes['excerptLength'] ?? 20 ) );

	$stories_query = FeaturedStories::build_query( $attributes );

	if ( ! $stories_query->have_posts() ) {
		return;
	}

	$wrapper_attributes = get_block_wrapper_attributes(
		array(
			'class' => 'cz-featured-stories',
			'style' => FeaturedStories::build_style_vars( $attributes ),
		)
	);
	?>
	<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
		<div class="cz-featured-stories__grid">
			<?php
			while ( $stories_query->have_posts() ) :
				$stories_query->the_post();

				$categories    = get_the_category();
				$category_name = ! empty( $categories ) ? $categories[0]->name : '';
				$reading_time  = FeaturedStories::reading_time_minutes();
				?>
				<article class="cz-featured-stories__card">
					<a class="cz-featured-stories__media" href="<?php the_permalink(); ?>" aria-hidden="true" tabindex="-1">
						<?php if ( has_post_thumbnail() ) : ?>
							<?php
							the_post_thumbnail(
								'medium_large',
								array(
									'class' => 'cz-featured-stories__image',
									'alt'   => '',
								)
							);
							?>
						<?php else : ?>
							<span class="cz-featured-stories__placeholder-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="40" height="40">
									<rect x="3" y="3" width="18" height="18" rx="2" />
									<circle cx="9" cy="9" r="2" />
									<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
								</svg>
							</span>
						<?php endif; ?>
						<?php if ( $category_name ) : ?>
							<span class="cz-featured-stories__badge"><?php echo esc_html( $category_name ); ?></span>
						<?php endif; ?>
					</a>
					<div class="cz-featured-stories__body">
						<div class="cz-featured-stories__meta">
							<span><?php echo esc_html( get_the_date() ); ?></span>
							<span aria-hidden="true">&middot;</span>
							<span>
								<?php
								/* translators: %d: estimated reading time in minutes. */
								echo esc_html( sprintf( _n( '%d min read', '%d min read', $reading_time, 'jif' ), $reading_time ) );
								?>
							</span>
						</div>
						<h3 class="cz-featured-stories__title"><?php the_title(); ?></h3>
						<p class="cz-featured-stories__excerpt"><?php echo esc_html( wp_trim_words( get_the_excerpt(), $excerpt_length ) ); ?></p>
						<a class="cz-featured-stories__link" href="<?php the_permalink(); ?>">
							<?php esc_html_e( 'Read more', 'jif' ); ?>
							<span class="screen-reader-text"><?php the_title(); ?></span>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" aria-hidden="true" width="12" height="12" fill="currentColor">
								<path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z" />
							</svg>
						</a>
					</div>
				</article>
				<?php
			endwhile;
			wp_reset_postdata();
			?>
		</div>
	</div>
	<?php
} )( $attributes );
