export const DEFAULT_ICON_NAME = 'arrow-right';
export const DEFAULT_ICON_STYLE = 'fa-sharp fa-solid';

export const ICON_STYLES = [
	{ label: 'Sharp Solid', value: 'fa-sharp fa-solid' },
	{ label: 'Sharp Regular', value: 'fa-sharp fa-regular' },
	{ label: 'Sharp Light', value: 'fa-sharp fa-light' },
	{ label: 'Sharp Thin', value: 'fa-sharp fa-thin' },
	{ label: 'Classic Solid', value: 'fa-solid' },
	{ label: 'Classic Regular', value: 'fa-regular' },
];

/**
 * Render a Font Awesome icon as an <i> element whose classes are resolved by
 * the Font Awesome Kit script at runtime (enqueued via Stackable).
 *
 * @param {string} slug    Icon name (e.g. "heart"), without the "fa-" prefix.
 * @param {string} style   FA style classes (e.g. "fa-sharp fa-solid").
 * @param {Object} [props] Extra props merged onto the <i> (e.g. className).
 * @return {JSX.Element} The rendered icon.
 */
export function renderIcon( slug, style, props = {} ) {
	const name = slug || DEFAULT_ICON_NAME;
	const styleClasses = style || DEFAULT_ICON_STYLE;
	const { className, ...rest } = props;

	return (
		<i
			className={ [ styleClasses, `fa-${ name }`, className ].filter( Boolean ).join( ' ' ) }
			{ ...rest }
		/>
	);
}
