import { useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Button, Popover, TextControl, BaseControl } from '@wordpress/components';
import { ALL_ICONS, renderIcon } from './icons';

const MAX_RESULTS = 60;

function toLabel( iconName ) {
	return iconName
		.split( '-' )
		.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
		.join( ' ' );
}

/**
 * Searchable Font Awesome icon picker: a button showing the current icon
 * that opens a popover with a search field and a filtered grid of results.
 */
export function IconPicker( { value, onChange, label } ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ search, setSearch ] = useState( '' );

	const results = useMemo( () => {
		const names = Object.keys( ALL_ICONS );
		const query = search.trim().toLowerCase();
		const filtered = query ? names.filter( ( name ) => name.includes( query ) ) : names;
		return filtered.slice( 0, MAX_RESULTS );
	}, [ search ] );

	const totalMatches = useMemo( () => {
		const query = search.trim().toLowerCase();
		if ( ! query ) {
			return Object.keys( ALL_ICONS ).length;
		}
		return Object.keys( ALL_ICONS ).filter( ( name ) => name.includes( query ) ).length;
	}, [ search ] );

	return (
		<BaseControl __nextHasNoMarginBottom>
			<BaseControl.VisualLabel>{ label }</BaseControl.VisualLabel>
			<Button
				variant="secondary"
				onClick={ () => setIsOpen( ( open ) => ! open ) }
				style={ { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'flex-start' } }
			>
				{ renderIcon( value, { style: { height: '18px', width: 'auto' } } ) }
				<span>{ toLabel( value ) }</span>
			</Button>
			{ isOpen && (
				<Popover placement="bottom-start" onClose={ () => setIsOpen( false ) } focusOnMount="firstElement">
					<div style={ { padding: '12px', width: '280px' } }>
						<TextControl
							value={ search }
							onChange={ setSearch }
							placeholder={ __( 'Search icons…', 'jif' ) }
							__nextHasNoMarginBottom
						/>
						<p style={ { margin: '8px 0 4px', fontSize: '11px', color: '#757575' } }>
							{ totalMatches > MAX_RESULTS
								? sprintf(
									/* translators: %1$d: number of results shown, %2$d: total matches. */
									__( 'Showing %1$d of %2$d matches — refine your search to see more.', 'jif' ),
									MAX_RESULTS,
									totalMatches
								)
								: sprintf(
									/* translators: %d: number of matches. */
									__( '%d icons', 'jif' ),
									totalMatches
								) }
						</p>
						<div
							style={ {
								display: 'grid',
								gridTemplateColumns: 'repeat(6, 1fr)',
								gap: '4px',
								maxHeight: '260px',
								overflowY: 'auto',
							} }
						>
							{ results.map( ( name ) => (
								<Button
									key={ name }
									label={ toLabel( name ) }
									isPressed={ value === name }
									onClick={ () => {
										onChange( name );
										setIsOpen( false );
									} }
									style={ {
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										height: '36px',
										padding: '6px',
									} }
								>
									{ renderIcon( name, { style: { height: '16px', width: 'auto' } } ) }
								</Button>
							) ) }
						</div>
					</div>
				</Popover>
			) }
		</BaseControl>
	);
}
