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
 * Render a Font Awesome icon. Prefers the real fetched SVG markup (saved in
 * the iconSvg attribute when the icon was picked — see icon-picker.jsx),
 * since that's a static string with no runtime dependency on Font Awesome's
 * webfont CSS having loaded. Falls back to an <i> class reference only for
 * content saved before iconSvg existed.
 *
 * @param {string} slug    Icon name (e.g. "heart"), without the "fa-" prefix.
 * @param {string} style   FA style classes (e.g. "fa-sharp fa-solid").
 * @param {string} svg     Fetched <svg>...</svg> markup, if available.
 * @param {Object} [props] Extra props merged onto the rendered element (e.g. className).
 * @return {JSX.Element} The rendered icon.
 */
export function renderIcon( slug, style, svg, props = {} ) {
	if ( svg ) {
		const { className, ...rest } = props;
		return (
			<span
				className={ className }
				{ ...rest }
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: svg } }
			/>
		);
	}

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
