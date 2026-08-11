import { __ } from '@wordpress/i18n';
import { BaseControl, TextControl, SelectControl } from '@wordpress/components';
import { renderIcon, ICON_STYLES } from './icons';

/**
 * Font Awesome icon controls: an icon-name text field and a style dropdown,
 * with a live preview rendered via the Font Awesome Kit script.
 */
export function IconPicker( { label, value, style, onChange, onStyleChange } ) {
	return (
		<BaseControl __nextHasNoMarginBottom>
			<BaseControl.VisualLabel>{ label }</BaseControl.VisualLabel>
			<div style={ { display: 'flex', alignItems: 'flex-start', gap: '8px' } }>
				<div
					style={ {
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						width: '36px',
						height: '36px',
						flexShrink: 0,
						border: '1px solid #ddd',
						borderRadius: '2px',
						fontSize: '18px',
					} }
				>
					{ renderIcon( value, style ) }
				</div>
				<div style={ { flexGrow: 1 } }>
					<TextControl
						value={ value }
						onChange={ onChange }
						placeholder={ __( 'e.g. heart', 'jif' ) }
						help={ __( 'Icon name from Font Awesome, without the "fa-" prefix.', 'jif' ) }
						__nextHasNoMarginBottom
					/>
					<SelectControl
						value={ style }
						options={ ICON_STYLES }
						onChange={ onStyleChange }
						__nextHasNoMarginBottom
					/>
				</div>
			</div>
		</BaseControl>
	);
}
