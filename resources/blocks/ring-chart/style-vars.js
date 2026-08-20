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
		eyebrowFontSize,
		labelFontWeight,
		fontFamily,
		coreLabelColor,
		ringLabelColor,
		backgroundColor,
	} = attributes;

	const vars = {
		'--cz-rc-core-size': withUnit( coreSize ?? 130 ),
		'--cz-rc-font-family': fontFamily,
		'--cz-rc-label-weight': labelFontWeight ?? '700',
		'--cz-rc-core-label-color': coreLabelColor || '#ffffff',
		'--cz-rc-ring-label-color': ringLabelColor || 'var(--theme-palette-color-1, #0c1488)',
		'--cz-rc-bg': backgroundColor || '#ffffff',
	};

	addResponsiveVars( vars, '--cz-rc-gap', ringGap );
	addResponsiveVars( vars, '--cz-rc-label-size', labelFontSize );
	addResponsiveVars( vars, '--cz-rc-eyebrow-size', eyebrowFontSize );

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
