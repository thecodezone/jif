/**
 * Convert block attributes into the CSS custom properties consumed by
 * style.css. Responsive attributes ({ desktop, tablet, mobile }) map to
 * three variables each; style.css switches between them at the matching
 * breakpoints. Mirrors comparison-bar's style-vars.js.
 */
function withUnit( value, unit = 'px' ) {
	if ( typeof value === 'number' ) {
		return `${ value }${ unit }`;
	}
	return value;
}

/**
 * Resolve a responsive { desktop, tablet, mobile } attribute into concrete
 * per-device values, cascading an unset device down from the one above it
 * (tablet falls back to desktop, mobile falls back to tablet).
 *
 * @param {Object} value Responsive attribute value.
 * @return {Object} { desktop, tablet, mobile }, each either a value or null.
 */
function cascade( value ) {
	const desktop = value?.desktop ?? null;
	const tablet = value?.tablet ?? desktop;
	const mobile = value?.mobile ?? tablet;
	return { desktop, tablet, mobile };
}

/**
 * Add the three per-device variables for a responsive attribute to a vars
 * object, omitting any device whose cascaded value is still unset so the
 * block's own CSS fallback applies instead.
 *
 * @param {Object} vars  Vars object to mutate.
 * @param {string} name  CSS variable base name (without the -desktop/-tablet/-mobile suffix).
 * @param {Object} value Responsive attribute value.
 */
function addResponsiveVars( vars, name, value ) {
	const resolved = cascade( value );
	( [ 'desktop', 'tablet', 'mobile' ] ).forEach( ( device ) => {
		if ( resolved[ device ] !== null ) {
			vars[ `${ name }-${ device }` ] = withUnit( resolved[ device ] );
		}
	} );
}

export function buildRingChartStyleVars( attributes ) {
	const {
		coreSize,
		ringGap,
		labelFontSize,
		labelFontWeight,
		fontFamily,
		coreLabelColor,
		ringLabelColor,
		backgroundColor,
		labelBorderRadius,
		labelBorderWidth,
		labelBorderStyle,
		labelBorderColor,
	} = attributes;

	const vars = {
		'--cz-rc-core-size': withUnit( coreSize ?? 130 ),
		'--cz-rc-font-family': fontFamily,
		'--cz-rc-label-weight': labelFontWeight ?? '700',
		'--cz-rc-core-label-color': coreLabelColor || '#ffffff',
		'--cz-rc-ring-label-color': ringLabelColor || 'var(--theme-palette-color-1)',
		'--cz-rc-bg': backgroundColor || '#ffffff',
		'--cz-rc-label-radius': withUnit( labelBorderRadius ?? 0 ),
		'--cz-rc-label-border-width': withUnit( labelBorderWidth ?? 0 ),
		'--cz-rc-label-border-style': labelBorderStyle || 'solid',
		'--cz-rc-label-border-color': labelBorderColor || 'transparent',
	};

	addResponsiveVars( vars, '--cz-rc-gap', ringGap );
	addResponsiveVars( vars, '--cz-rc-label-size', labelFontSize );

	return vars;
}

/**
 * Per-ring inline style: the ring's own color and its 0-based index (used
 * by style.css to grow each successive ring's diameter by the gap).
 *
 * @param {Object} ring  { label, color }.
 * @param {number} index 0-based ring index (0 = innermost/core).
 */
export function buildRingStyleVars( ring, index ) {
	return {
		'--cz-rc-ring-color': ring.color,
		'--i': index,
	};
}

/**
 * A ring's radius in pixels, given the core diameter and the (already
 * device-resolved) gap between successive rings.
 *
 * @param {number} coreSize Core diameter, in pixels.
 * @param {number} gap      Gap added per ring step, in pixels, for the current breakpoint.
 * @param {number} index    0-based ring index (0 = innermost/core).
 * @return {number} Ring radius, in pixels.
 */
export function ringRadius( coreSize, gap, index ) {
	return coreSize / 2 + gap * index;
}

/**
 * How far a ring's label needs to shift down from the ring's top peak so it
 * sits on the arc as it actually runs under the label, rather than on the
 * peak alone.
 *
 * The label is centered on the ring's top-dead-center point, but the ring's
 * circular edge curves away from that point across the label's width — a
 * wide label on a small ring "sees" a lower arc at its edges than at its
 * center. This returns that drop (a circular sagitta) so the label can be
 * nudged down to sit on the arc's local average height instead of the peak.
 *
 * @param {number} radius        Ring radius, in pixels.
 * @param {number} labelHalfWidth Half of the label's rendered width, in pixels.
 * @return {number} Vertical offset, in pixels (0 if the label is narrower than the ring itself allows).
 */
export function computeLabelDip( radius, labelHalfWidth ) {
	if ( ! radius || ! labelHalfWidth || labelHalfWidth <= 0 ) {
		return 0;
	}
	const clampedHalfWidth = Math.min( labelHalfWidth, radius );
	return radius - Math.sqrt( radius ** 2 - clampedHalfWidth ** 2 );
}
