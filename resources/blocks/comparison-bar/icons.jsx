import * as solidIcons from '@fortawesome/free-solid-svg-icons';

/**
 * Every free Font Awesome solid icon, keyed by its kebab-case icon name
 * (e.g. "arrow-right"), for the searchable icon picker.
 */
export const ALL_ICONS = Object.values( solidIcons )
	.filter( ( def ) => def && def.icon && def.iconName )
	.reduce( ( acc, def ) => {
		acc[ def.iconName ] = def;
		return acc;
	}, {} );

const DEFAULT_ICON_NAME = 'arrow-right';

/**
 * Get the Font Awesome icon definition for a given icon slug, falling back
 * to the default arrow if the slug isn't found.
 *
 * @param {string} slug Icon attribute value (FA icon name, e.g. "arrow-right").
 * @return {Object} FA icon definition ({ icon: [width, height, ligatures, unicode, path] }).
 */
export function getIconDefinition( slug ) {
	return ALL_ICONS[ slug ] ?? ALL_ICONS[ DEFAULT_ICON_NAME ];
}

/**
 * Render a Font Awesome icon as an inline SVG element, sized by height only
 * so its natural width/height ratio is preserved (no empty padding around
 * non-square glyphs, and wider icons render wider without extra whitespace).
 *
 * @param {string} slug    Icon attribute value.
 * @param {Object} [props] Extra props merged onto the <svg> (e.g. className).
 * @return {JSX.Element} The rendered icon.
 */
export function renderIcon( slug, props = {} ) {
	const definition = getIconDefinition( slug );
	const [ width, height, , , pathData ] = definition.icon;
	const paths = Array.isArray( pathData ) ? pathData : [ pathData ];

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={ `0 0 ${ width } ${ height }` }
			fill="currentColor"
			{ ...props }
		>
			{ paths.map( ( d, i ) => (
				<path key={ i } d={ d } />
			) ) }
		</svg>
	);
}
