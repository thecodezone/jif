/**
 * Convert block attributes into CSS custom properties consumed by style.css.
 * Responsive attributes ({ desktop, tablet, mobile }) map to three variables
 * each; style.css switches between them at the matching breakpoints.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Inline style object for the block's wrapper element.
 */
function withUnit( value, defaultVal, unit = 'px' ) {
	const val = value ?? defaultVal;
	if ( typeof val === 'number' ) {
		return `${ val }${ unit }`;
	}
	return val;
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

	return {
		'--cz-cb-font-family': fontFamily,
		'--cz-cb-icon-color': iconColor || 'inherit',
		'--cz-cb-icon-size-desktop': withUnit( iconSize?.desktop, 32 ),
		'--cz-cb-icon-size-tablet': withUnit( iconSize?.tablet, 28 ),
		'--cz-cb-icon-size-mobile': withUnit( iconSize?.mobile, 24 ),
		'--cz-cb-before-color': beforeColor,
		'--cz-cb-after-color': afterColor,
		'--cz-cb-before-size-desktop': withUnit( beforeFontSize?.desktop, 17 ),
		'--cz-cb-before-size-tablet': withUnit( beforeFontSize?.tablet, 16 ),
		'--cz-cb-before-size-mobile': withUnit( beforeFontSize?.mobile, 15 ),
		'--cz-cb-after-size-desktop': withUnit( afterFontSize?.desktop, 17 ),
		'--cz-cb-after-size-tablet': withUnit( afterFontSize?.tablet, 16 ),
		'--cz-cb-after-size-mobile': withUnit( afterFontSize?.mobile, 15 ),
		'--cz-cb-before-weight': beforeFontWeight ?? 600,
		'--cz-cb-after-weight': afterFontWeight ?? 800,
		'--cz-cb-background': backgroundColor || '#f7f8fd',
		'--cz-cb-border-color': borderColor || '#e2e5f1',
		'--cz-cb-border-width': withUnit( borderWidth, 0 ),
		'--cz-cb-border-radius': withUnit( borderRadius, 0 ),
		'--cz-cb-padding-desktop': withUnit( padding?.desktop, 28 ),
		'--cz-cb-padding-tablet': withUnit( padding?.tablet, 22 ),
		'--cz-cb-padding-mobile': withUnit( padding?.mobile, 18 ),
	};
}
