/**
 * Convert block attributes into CSS custom properties consumed by style.css.
 * Responsive attributes ({ desktop, tablet, mobile }) map to three variables
 * each; style.css switches between them at the matching breakpoints.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Inline style object for the block's wrapper element.
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
 * (tablet falls back to desktop, mobile falls back to tablet). Returns null
 * for a device — and every device below it — once nothing has been set yet.
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
 * block's own CSS fallback/inheritance applies instead.
 *
 * @param {Object} vars Vars object to mutate.
 * @param {string} name CSS variable base name (without the -desktop/-tablet/-mobile suffix).
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

export function buildBarStyleVars( attributes ) {
	const {
		iconColor,
		iconSize,
		beforeColor,
		afterColor,
		beforeFontSize,
		afterFontSize,
		beforeFontWeight,
		afterFontWeight,
		fontFamily,
		backgroundColor,
		borderColor,
		borderWidth,
		borderRadius,
		padding,
	} = attributes;

	const vars = {
		'--cz-cb-font-family': fontFamily,
		'--cz-cb-icon-color': iconColor || 'inherit',
		'--cz-cb-before-color': beforeColor,
		'--cz-cb-after-color': afterColor,
		'--cz-cb-before-weight': beforeFontWeight ?? 600,
		'--cz-cb-after-weight': afterFontWeight ?? 800,
		'--cz-cb-background': backgroundColor || '#f7f8fd',
		'--cz-cb-border-color': borderColor || '#e2e5f1',
		'--cz-cb-border-width': withUnit( borderWidth ?? 0 ),
		'--cz-cb-border-radius': withUnit( borderRadius ?? 0 ),
	};

	addResponsiveVars( vars, '--cz-cb-icon-size', iconSize );
	addResponsiveVars( vars, '--cz-cb-before-size', beforeFontSize );
	addResponsiveVars( vars, '--cz-cb-after-size', afterFontSize );
	addResponsiveVars( vars, '--cz-cb-padding', padding );

	return vars;
}
