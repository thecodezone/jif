import { RichText, useBlockProps } from '@wordpress/block-editor';
import { buildBarStyleVars } from './style-vars';

/**
 * Pre-Font-Awesome-Kit version: icons were saved as an inline <svg> (path
 * data imported from @fortawesome/free-solid-svg-icons at build time)
 * instead of an <i> tag resolved by the Kit script at runtime. The iconStyle
 * attribute didn't exist yet, so it isn't referenced here.
 *
 * This deprecation's `save` can't reproduce that exact old SVG synchronously
 * (doing so would mean bundling the whole icon library again, undoing the
 * size win from switching to Kit classes) — WordPress only needs `isEligible`
 * plus `migrate` to accept old content and convert its attributes; it
 * doesn't require `save`'s output to match byte-for-byte once `isEligible`
 * already identified the block as this deprecated version.
 */
const v1 = {
	attributes: {
		beforeText: {
			type: 'string',
			source: 'html',
			selector: '.cz-comparison-bar__before',
			default: 'Before',
		},
		afterText: {
			type: 'string',
			source: 'html',
			selector: '.cz-comparison-bar__after',
			default: 'After',
		},
		beforeUrl: { type: 'string', default: '' },
		afterUrl: { type: 'string', default: '' },
		icon: { type: 'string', default: 'arrow-right' },
		iconColor: { type: 'string', default: ' ' },
		iconSize: { type: 'object', default: {} },
		beforeColor: { type: 'string', default: 'var(--theme-palette-color-3, #687279)' },
		afterColor: { type: 'string', default: 'var(--theme-palette-color-1, #0c1488)' },
		beforeFontSize: { type: 'object', default: {} },
		afterFontSize: { type: 'object', default: {} },
		beforeFontWeight: { type: 'string', default: '600' },
		afterFontWeight: { type: 'string', default: '800' },
		fontFamily: { type: 'string', default: 'var(--font-serif)' },
		backgroundColor: { type: 'string', default: '#f7f8fd' },
		borderColor: { type: 'string', default: '#e2e5f1' },
		borderWidth: { type: 'number', default: 1 },
		borderRadius: { type: 'number', default: 10 },
		padding: { type: 'object', default: {} },
		stackOnMobile: { type: 'boolean', default: true },
	},

	/**
	 * Matches old saved markup by structure (an <svg> in the icon slot)
	 * rather than requiring exact path data, so this doesn't need the icon
	 * library bundled just to recognize old content.
	 *
	 * @param {Object} attributes  Parsed block attributes.
	 * @param {string} innerHTML   Raw saved inner HTML.
	 * @return {boolean} Whether this deprecation applies.
	 */
	isEligible( attributes, innerHTML ) {
		return typeof innerHTML === 'string' && innerHTML.includes( 'cz-comparison-bar__icon' ) && innerHTML.includes( '<svg' );
	},

	save( { attributes } ) {
		const blockProps = useBlockProps.save( {
			className: [ 'cz-comparison-bar', attributes.stackOnMobile ? 'is-stacked-mobile' : '' ]
				.filter( Boolean )
				.join( ' ' ),
			style: buildBarStyleVars( attributes ),
		} );

		return (
			<div { ...blockProps }>
				<div className="cz-comparison-bar__inner">
					<RichText.Content
						tagName={ attributes.beforeUrl ? 'a' : 'div' }
						href={ attributes.beforeUrl ? attributes.beforeUrl : undefined }
						className="cz-comparison-bar__before"
						value={ attributes.beforeText }
					/>
					<div className="cz-comparison-bar__icon" aria-hidden="true" />
					<RichText.Content
						tagName={ attributes.afterUrl ? 'a' : 'div' }
						href={ attributes.afterUrl ? attributes.afterUrl : undefined }
						className="cz-comparison-bar__after"
						value={ attributes.afterText }
					/>
				</div>
			</div>
		);
	},

	migrate( attributes ) {
		return { ...attributes, iconStyle: 'fa-sharp fa-solid' };
	},
};

export default [ v1 ];
