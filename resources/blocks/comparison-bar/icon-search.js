/**
 * PHP localizes the Stackable Font Awesome kit settings (read from the
 * `stackable_icons_fa_kit` / `stackable_icons_fa_version` options via
 * get_option() — see ComparisonBar::register()) into window.czFontAwesomeKit
 * before this script runs, so it's always available synchronously. This
 * replaced an earlier approach of polling window.FontAwesomeKitConfig, a
 * global that's only set by the Kit's own <script> tag — which isn't
 * reliably enqueued (Stackable only injects it once a kit token is saved,
 * and only where it actually loads the kit).
 *
 * @return {{version: string, isPro: boolean, token: string, baseUrl: string}} Kit info.
 */
function getKitInfo() {
	const config = window.czFontAwesomeKit;
	return {
		version: config?.version || '6.5.1',
		isPro: !! config?.token,
		token: config?.token || '',
		baseUrl: 'https://ka-p.fontawesome.com',
	};
}

/**
 * Map our "fa-sharp fa-solid"-style class strings to the CDN's per-style SVG
 * folder name (e.g. "sharp-solid"), the same alias table Stackable's
 * util/fontawesome/index.js uses (aliasToFamilyStyle) but keyed by our own
 * class-string values instead of FA's short prefixes.
 */
const STYLE_TO_FAMILY_STYLE = {
	'fa-sharp fa-solid': 'sharp-solid',
	'fa-sharp fa-regular': 'sharp-regular',
	'fa-sharp fa-light': 'sharp-light',
	'fa-sharp fa-thin': 'sharp-thin',
	'fa-solid': 'solid',
	'fa-regular': 'regular',
};

const svgCache = {};

/**
 * Fetch (and cache) an icon's real SVG markup from Font Awesome's kit CDN —
 * the same endpoint Stackable's faFetchIcon() uses — for use as a live
 * preview in the icon picker's search results grid.
 *
 * @param {string} name  Icon name (e.g. "heart").
 * @param {string} style FA style classes (e.g. "fa-sharp fa-solid").
 * @return {Promise<string>} Raw <svg>...</svg> markup, or '' if unavailable.
 */
export async function fetchIconSvg( name, style ) {
	const familyStyle = STYLE_TO_FAMILY_STYLE[ style ] || 'solid';
	const cacheKey = `${ familyStyle }/${ name }`;

	if ( svgCache[ cacheKey ] !== undefined ) {
		return svgCache[ cacheKey ];
	}

	try {
		const { token, baseUrl, version } = getKitInfo();
		const url = `${ baseUrl }/releases/v${ version }/svgs/${ familyStyle }/${ name }.svg?token=${ token }`;
		const response = await fetch( url );

		if ( ! response.ok ) {
			// eslint-disable-next-line no-console
			console.warn( 'fetchIconSvg: non-OK response', url, response.status );
			return '';
		}

		const svg = await response.text();

		if ( ! svg.includes( '<svg' ) ) {
			// eslint-disable-next-line no-console
			console.warn( 'fetchIconSvg: response was not SVG markup', url, svg.slice( 0, 200 ) );
			return '';
		}

		svgCache[ cacheKey ] = svg;
		return svg;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn( 'fetchIconSvg: fetch threw', name, style, error );
		return '';
	}
}

/**
 * Search Font Awesome's public icon catalog (the same GraphQL API Stackable
 * uses), returning matching icon names along with which style families each
 * one is available in under this kit's license.
 *
 * @param {string} query Search term (e.g. "heart").
 * @return {Promise<Array<{name: string, families: string[]}>>} Matching icons.
 */
export async function searchFontAwesomeIcons( query ) {
	const term = ( query || '' ).trim().replace( /["'\\]/g, '' );

	if ( ! term ) {
		return [];
	}

	const { version, isPro } = getKitInfo();

	const graphqlQuery = `{
		search(version: "${ version }", first: 60, query: "${ term }") {
			id
			familyStylesByLicense {
				free { style, family }
				${ isPro ? 'pro { style, family }' : '' }
			}
		}
	}`;

	const response = await fetch( 'https://api.fontawesome.com', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		body: JSON.stringify( { query: graphqlQuery } ),
	} );

	const { data } = await response.json();

	return ( data?.search ?? [] ).map( ( icon ) => {
		const licenses = icon.familyStylesByLicense;
		const families = [
			...licenses.free.map( ( f ) => f.family ),
			...( isPro ? licenses.pro.map( ( f ) => f.family ) : [] ),
		];
		return { name: icon.id, families: [ ...new Set( families ) ] };
	} );
}
