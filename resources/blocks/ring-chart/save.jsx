import { RichText, useBlockProps } from '@wordpress/block-editor';
import { buildRingChartStyleVars, buildRingStyleVars } from './style-vars';

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: 'cz-ring-chart',
		style: buildRingChartStyleVars( attributes ),
	} );

	return (
		<div { ...blockProps }>
			{ attributes.rings.map( ( ring, index ) => {
				const isCore = index === 0;
				return (
					<div
						key={ index }
						className={ [ 'cz-ring-chart__ring', isCore ? 'is-core' : '' ].filter( Boolean ).join( ' ' ) }
						style={ buildRingStyleVars( ring, index ) }
					>
						<div className="cz-ring-chart__label">
							<RichText.Content
								tagName="span"
								className="cz-ring-chart__name"
								value={ ring.label }
							/>
						</div>
					</div>
				);
			} ) }
		</div>
	);
}
