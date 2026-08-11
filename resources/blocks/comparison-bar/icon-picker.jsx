import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { BaseControl, Button, Popover, TextControl, SelectControl, Spinner } from '@wordpress/components';
import { ICON_STYLES } from './icons';
import { searchFontAwesomeIcons, fetchIconSvg } from './icon-search';

const SEARCH_DEBOUNCE_MS = 500;

function toLabel( iconName ) {
	return iconName
		.split( '-' )
		.map( ( word ) => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) )
		.join( ' ' );
}

/**
 * An icon rendered as a real inline SVG fetched from Font Awesome's kit CDN
 * (cached by icon-search.js) rather than the Kit script's webfont <i>
 * classes — this avoids depending on the webfont CSS having finished
 * loading wherever the icon happens to render (the inspector sidebar, a
 * Popover portal, etc.).
 */
function FetchedIcon( { name, style, size = 16 } ) {
	const [ svg, setSvg ] = useState( '' );

	useEffect( () => {
		let isMounted = true;
		setSvg( '' );
		fetchIconSvg( name, style ).then( ( markup ) => {
			if ( isMounted ) {
				setSvg( markup );
			}
		} );
		return () => {
			isMounted = false;
		};
	}, [ name, style ] );

	if ( ! svg ) {
		return <Spinner style={ { width: `${ size }px`, height: `${ size }px`, margin: 0 } } />;
	}

	return (
		<span
			style={ { display: 'flex', width: `${ size }px`, height: `${ size }px` } }
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={ { __html: svg } }
		/>
	);
}

/**
 * A single search-result icon button. Selecting it re-fetches (from cache,
 * since the preview above already primed it) the icon's SVG so onSelect can
 * hand the caller the actual markup to save — not just the name — per
 * icons.jsx's renderIcon(), which needs real SVG markup to render reliably.
 */
function IconResultButton( { name, style, isSelected, onSelect } ) {
	return (
		<Button
			label={ toLabel( name ) }
			isPressed={ isSelected }
			onClick={ () => fetchIconSvg( name, style ).then( ( svg ) => onSelect( name, svg ) ) }
			style={ {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '36px',
				padding: '6px',
			} }
		>
			<FetchedIcon name={ name } style={ style } size={ 16 } />
		</Button>
	);
}

/**
 * Font Awesome icon controls: a live search popover backed by Font Awesome's
 * public icon-search API (icon-search.js) — the same one Stackable uses —
 * plus a style dropdown applied to whichever icon is selected. The button
 * that shows the CURRENTLY SELECTED icon still uses the Kit's <i> classes
 * (renderIcon), since that's how the block renders on the frontend; only the
 * search-results grid uses fetched SVGs, for a reliable live preview.
 */
export function IconPicker( { label, value, style, onChange, onStyleChange } ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ search, setSearch ] = useState( '' );
	const [ results, setResults ] = useState( [] );
	const [ isSearching, setIsSearching ] = useState( false );
	const debounceRef = useRef( null );

	useEffect( () => {
		clearTimeout( debounceRef.current );

		if ( ! search.trim() ) {
			setResults( [] );
			setIsSearching( false );
			return;
		}

		setIsSearching( true );

		debounceRef.current = setTimeout( () => {
			searchFontAwesomeIcons( search )
				.then( setResults )
				.catch( () => setResults( [] ) )
				.finally( () => setIsSearching( false ) );
		}, SEARCH_DEBOUNCE_MS );

		return () => clearTimeout( debounceRef.current );
	}, [ search ] );

	return (
		<BaseControl __nextHasNoMarginBottom>
			<BaseControl.VisualLabel>{ label }</BaseControl.VisualLabel>
			<Button
				variant="secondary"
				label={ toLabel( value ) }
				showTooltip
				onClick={ () => setIsOpen( ( open ) => ! open ) }
				style={ { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', padding: 0 } }
			>
				<FetchedIcon name={ value } style={ style } size={ 18 } />
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
						<div style={ { minHeight: '260px', maxHeight: '260px', overflowY: 'auto', marginTop: '8px' } }>
							{ isSearching && (
								<div style={ { display: 'flex', justifyContent: 'center', padding: '24px' } }>
									<Spinner />
								</div>
							) }
							{ ! isSearching && search.trim() && results.length === 0 && (
								<p style={ { fontSize: '12px', color: '#757575', padding: '8px' } }>
									{ __( 'No icons found.', 'jif' ) }
								</p>
							) }
							{ ! isSearching && ! search.trim() && (
								<p style={ { fontSize: '12px', color: '#757575', padding: '8px' } }>
									{ __( 'Start typing to search Font Awesome icons…', 'jif' ) }
								</p>
							) }
							{ ! isSearching && results.length > 0 && (
								<div
									style={ {
										display: 'grid',
										gridTemplateColumns: 'repeat(6, 1fr)',
										gap: '4px',
									} }
								>
									{ results.map( ( icon ) => (
										<IconResultButton
											key={ icon.name }
											name={ icon.name }
											style={ style }
											isSelected={ value === icon.name }
											onSelect={ ( name, svg ) => {
												onChange( name, svg );
												setIsOpen( false );
											} }
										/>
									) ) }
								</div>
							) }
						</div>
					</div>
				</Popover>
			) }
			<SelectControl
				value={ style }
				options={ ICON_STYLES }
				onChange={ onStyleChange }
				__nextHasNoMarginBottom
			/>
		</BaseControl>
	);
}
