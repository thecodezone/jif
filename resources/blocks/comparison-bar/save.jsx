import { RichText, useBlockProps } from '@wordpress/block-editor';
import { renderIcon } from './icons';
import { buildBarStyleVars } from './style-vars';

export default function save( { attributes } ) {
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
				<div className="cz-comparison-bar__icon" aria-hidden="true">
					{ renderIcon( attributes.icon, attributes.iconStyle, { className: 'cz-comparison-bar__icon-svg' } ) }
				</div>
				<RichText.Content
					tagName={ attributes.afterUrl ? 'a' : 'div' }
					href={ attributes.afterUrl ? attributes.afterUrl : undefined }
					className="cz-comparison-bar__after"
					value={ attributes.afterText }
				/>
			</div>
		</div>
	);
}
