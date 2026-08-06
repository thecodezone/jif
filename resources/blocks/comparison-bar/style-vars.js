/**
 * Convert block attributes into CSS custom properties consumed by style.css.
 * Responsive attributes ({ desktop, tablet, mobile }) map to three variables
 * each; style.css switches between them at the matching breakpoints.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Inline style object for the block's wrapper element.
 */
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
		'--cz-cb-icon-color': iconColor ?? 'inherit',
		'--cz-cb-icon-size-desktop': `${ iconSize?.desktop ?? 32 }px`,
		'--cz-cb-icon-size-tablet': `${ iconSize?.tablet ?? 28 }px`,
		'--cz-cb-icon-size-mobile': `${ iconSize?.mobile ?? 24 }px`,
		'--cz-cb-before-color': beforeColor,
		'--cz-cb-after-color': afterColor,
		'--cz-cb-before-size-desktop': `${ beforeFontSize?.desktop ?? 17 }px`,
		'--cz-cb-before-size-tablet': `${ beforeFontSize?.tablet ?? 16 }px`,
		'--cz-cb-before-size-mobile': `${ beforeFontSize?.mobile ?? 15 }px`,
		'--cz-cb-after-size-desktop': `${ afterFontSize?.desktop ?? 17 }px`,
		'--cz-cb-after-size-tablet': `${ afterFontSize?.tablet ?? 16 }px`,
		'--cz-cb-after-size-mobile': `${ afterFontSize?.mobile ?? 15 }px`,
		'--cz-cb-before-weight': beforeFontWeight ?? 600,
		'--cz-cb-after-weight': afterFontWeight ?? 800,
		'--cz-cb-background': backgroundColor || '#f7f8fd',
		'--cz-cb-border-color': borderColor || '#e2e5f1',
		'--cz-cb-border-width': `${ borderWidth ?? 0 }px`,
		'--cz-cb-border-radius': `${ borderRadius ?? 0 }px`,
		'--cz-cb-padding-desktop': `${ padding?.desktop ?? 28 }px`,
		'--cz-cb-padding-tablet': `${ padding?.tablet ?? 22 }px`,
		'--cz-cb-padding-mobile': `${ padding?.mobile ?? 18 }px`,
	};
}
