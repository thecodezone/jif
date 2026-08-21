import { useState, useLayoutEffect, useRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	RichText,
	useBlockProps,
	useSettings,
	InspectorControls,
	PanelColorSettings,
} from '@wordpress/block-editor';
import {
	BaseControl,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ButtonGroup,
	Button,
	Dropdown,
	ColorPalette,
	Icon,
} from '@wordpress/components';
import { desktop, tablet, mobile, plus, trash, dragHandle } from '@wordpress/icons';
import { buildRingChartStyleVars, buildRingStyleVars, computeLabelDip } from './style-vars';

const MIN_RINGS = 2;
const MAX_RINGS = 5;

const DEVICES = [
	{ key: 'desktop', label: __( 'Desktop', 'jif' ), icon: desktop },
	{ key: 'tablet', label: __( 'Tablet', 'jif' ), icon: tablet },
	{ key: 'mobile', label: __( 'Mobile', 'jif' ), icon: mobile },
];

const FONT_WEIGHTS = [
	{ label: 'Regular (400)', value: '400' },
	{ label: 'Medium (500)', value: '500' },
	{ label: 'Semibold (600)', value: '600' },
	{ label: 'Bold (700)', value: '700' },
	{ label: 'Extrabold (800)', value: '800' },
];

const BORDER_STYLES = [
	{ label: 'Solid', value: 'solid' },
	{ label: 'Dashed', value: 'dashed' },
	{ label: 'Dotted', value: 'dotted' },
];

// Generic, theme-driven fallbacks for newly added rings — the palette a
// Blocksy Customizer defines, not a hardcoded brand palette, so the block
// looks reasonable on any site it's dropped into.
const DEFAULT_RING_COLORS = [
	'var(--theme-palette-color-1)',
	'var(--theme-palette-color-2)',
	'var(--theme-palette-color-3)',
	'var(--theme-palette-color-4)',
	'var(--theme-palette-color-5)',
];

function ResponsiveRange( { label, value, onChange, min, max, step } ) {
	const [ device, setDevice ] = useState( 'desktop' );

	return (
		<div className="cz-rc-responsive-control">
			<div className="cz-rc-responsive-control__header">
				<BaseControl.VisualLabel>{ label }</BaseControl.VisualLabel>
				<ButtonGroup>
					{ DEVICES.map( ( d ) => (
						<Button
							key={ d.key }
							icon={ d.icon }
							label={ d.label }
							isPressed={ device === d.key }
							size="small"
							onClick={ () => setDevice( d.key ) }
						/>
					) ) }
				</ButtonGroup>
			</div>
			<RangeControl
				value={ value?.[ device ] }
				onChange={ ( next ) => onChange( { ...value, [ device ]: next } ) }
				min={ min }
				max={ max }
				step={ step || 1 }
				allowReset
				resetFallbackValue={ undefined }
				__nextHasNoMarginBottom
			/>
		</div>
	);
}

/**
 * Font size control backed by the theme's font-size presets (theme.json),
 * with a "Custom" option that falls back to a responsive px slider.
 * Mirrors comparison-bar's FontSizeControl.
 */
function FontSizeControl( { label, value, onChange, min, max, step } ) {
	const [ fontSizes ] = useSettings( 'typography.fontSizes' );
	const presets = fontSizes ?? [];

	const presetVar = ( slug ) => `var(--wp--preset--font-size--${ slug })`;
	const allSame = value?.desktop === value?.tablet && value?.tablet === value?.mobile;
	const matchedPreset = allSame && presets.find( ( preset ) => presetVar( preset.slug ) === value?.desktop );

	const options = [
		...presets.map( ( preset ) => ( { label: preset.name, value: presetVar( preset.slug ) } ) ),
		{ label: __( 'Custom…', 'jif' ), value: 'custom' },
	];

	const isCustom = ! matchedPreset;

	return (
		<div className="cz-rc-font-size-control">
			<SelectControl
				label={ label }
				value={ isCustom ? 'custom' : value?.desktop }
				options={ options }
				onChange={ ( next ) => {
					if ( next === 'custom' ) {
						onChange( { desktop: min, tablet: min, mobile: min } );
					} else {
						onChange( { desktop: next, tablet: next, mobile: next } );
					}
				} }
				__nextHasNoMarginBottom
			/>
			{ isCustom && (
				<ResponsiveRange
					label={ label }
					value={ value }
					onChange={ onChange }
					min={ min }
					max={ max }
					step={ step }
				/>
			) }
		</div>
	);
}

/**
 * Tracks how far a non-core ring's label needs to shift down so it sits on
 * the ring's arc as it actually runs under the label's width, not just on
 * the arc's top peak (see computeLabelDip). Re-measures whenever the ring
 * or the label's own rendered size changes — different breakpoints resize
 * both the ring's radius and the label's font size / text wrapping.
 *
 * @param {Object}  ringRef  Ref to the ring wrapper element.
 * @param {Object}  labelRef Ref to the label element to nudge (its own
 *                           padding is left out of the measurement — it's
 *                           the margin that absorbs the arc's residual
 *                           curve, not span that itself needs covering).
 * @param {Object}  textRef  Ref to the text node inside the label, whose
 *                           rendered width drives the dip calculation.
 * @param {boolean} enabled  Whether to measure at all — false for the core
 *                           ring, whose label isn't positioned on any arc.
 */
function useLabelDip( ringRef, labelRef, textRef, enabled ) {
	useLayoutEffect( () => {
		const ringEl = ringRef.current;
		const labelEl = labelRef.current;
		const textEl = textRef.current;
		if ( ! enabled || ! ringEl || ! labelEl || ! textEl ) {
			return;
		}

		const measure = () => {
			const radius = ringEl.getBoundingClientRect().width / 2;
			const halfWidth = textEl.getBoundingClientRect().width / 2;
			const dip = computeLabelDip( radius, halfWidth );
			labelEl.style.setProperty( '--cz-rc-label-dip', `${ dip }px` );
		};

		measure();

		const observer = new ResizeObserver( measure );
		observer.observe( ringEl );
		observer.observe( textEl );

		return () => observer.disconnect();
	}, [ ringRef, labelRef, textRef, enabled ] );
}

/**
 * One row in the rings repeater — a drag handle (reorders which ring is
 * innermost), a color swatch (opens a ColorPalette popover, same preset
 * swatches as the Color panel), and a remove button; the label itself is
 * edited inline on the ring diagram via RichText, not here.
 */
function RingRow( { index, ring, colors, onChangeColor, onRemove, canRemove, isDragging, onDragStart, onDragOver, onDrop, onDragEnd } ) {
	return (
		<div
			className={ [ 'cz-rc-ring-row', isDragging ? 'is-dragging' : '' ].filter( Boolean ).join( ' ' ) }
			draggable
			onDragStart={ onDragStart }
			onDragOver={ onDragOver }
			onDrop={ onDrop }
			onDragEnd={ onDragEnd }
		>
			<span
				className="cz-rc-ring-row__handle"
				aria-label={ sprintf( __( 'Drag to reorder ring %d', 'jif' ), index + 1 ) }
			>
				<Icon icon={ dragHandle } size={ 16 } />
			</span>
			<span className="cz-rc-ring-row__index">{ index + 1 }</span>
			<span className="cz-rc-ring-row__label">
				{ ring.label || __( '(empty label)', 'jif' ) }
			</span>
			<Dropdown
				renderToggle={ ( { isOpen, onToggle } ) => (
					<button
						type="button"
						className="cz-rc-ring-row__swatch"
						style={ { background: ring.color } }
						aria-expanded={ isOpen }
						onClick={ onToggle }
						aria-label={ sprintf( __( 'Ring %d color', 'jif' ), index + 1 ) }
					/>
				) }
				renderContent={ () => (
					<ColorPalette
						colors={ colors }
						value={ ring.color }
						onChange={ onChangeColor }
						enableAlpha={ false }
						clearable={ false }
					/>
				) }
			/>
			<Button
				icon={ trash }
				label={ sprintf( __( 'Remove ring %d', 'jif' ), index + 1 ) }
				onClick={ onRemove }
				disabled={ ! canRemove }
				size="small"
			/>
		</div>
	);
}

export default function edit( { attributes, setAttributes } ) {
	const {
		rings,
		coreSize,
		ringGap,
		labelFontSize,
		labelFontWeight,
		fontFamily,
		coreLabelColor,
		ringLabelColor,
		backgroundColor,
		labelBorderRadius,
		labelBorderWidth,
		labelBorderStyle,
		labelBorderColor,
	} = attributes;

	const [ colors ] = useSettings( 'color.palette' );

	const [ draggedIndex, setDraggedIndex ] = useState( null );

	const updateRing = ( index, patch ) => {
		const next = rings.map( ( ring, i ) => ( i === index ? { ...ring, ...patch } : ring ) );
		setAttributes( { rings: next } );
	};

	const addRing = () => {
		if ( rings.length >= MAX_RINGS ) {
			return;
		}
		setAttributes( { rings: [ ...rings, { label: '', color: DEFAULT_RING_COLORS[ rings.length ] } ] } );
	};

	const removeRing = ( index ) => {
		if ( rings.length <= MIN_RINGS ) {
			return;
		}
		setAttributes( { rings: rings.filter( ( _, i ) => i !== index ) } );
	};

	const moveRing = ( from, to ) => {
		if ( from === to ) {
			return;
		}
		const next = [ ...rings ];
		const [ moved ] = next.splice( from, 1 );
		next.splice( to, 0, moved );
		setAttributes( { rings: next } );
	};

	const blockProps = useBlockProps( {
		className: 'cz-ring-chart',
		style: buildRingChartStyleVars( attributes ),
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Rings', 'jif' ) } initialOpen>
					{ rings.map( ( ring, index ) => (
						<RingRow
							key={ index }
							index={ index }
							ring={ ring }
							colors={ colors }
							onChangeColor={ ( color ) => updateRing( index, { color } ) }
							onRemove={ () => removeRing( index ) }
							canRemove={ rings.length > MIN_RINGS }
							isDragging={ draggedIndex === index }
							onDragStart={ ( e ) => {
								setDraggedIndex( index );
								e.dataTransfer.effectAllowed = 'move';
							} }
							onDragOver={ ( e ) => e.preventDefault() }
							onDrop={ ( e ) => {
								e.preventDefault();
								if ( draggedIndex !== null ) {
									moveRing( draggedIndex, index );
								}
								setDraggedIndex( null );
							} }
							onDragEnd={ () => setDraggedIndex( null ) }
						/>
					) ) }
					<Button
						className="cz-rc-add-ring"
						icon={ plus }
						variant="secondary"
						size="small"
						onClick={ addRing }
						disabled={ rings.length >= MAX_RINGS }
					>
						{ __( 'Add ring', 'jif' ) }
					</Button>
					<p className="components-base-control__help">
						{ __( 'Drag to reorder. Edit each label directly on the diagram. 2–5 rings; ring 1 is the innermost.', 'jif' ) }
					</p>
				</PanelBody>

				<PanelBody title={ __( 'Layout', 'jif' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Core size', 'jif' ) }
						help={ __( 'Diameter of the innermost ring, in pixels.', 'jif' ) }
						value={ coreSize }
						onChange={ ( value ) => setAttributes( { coreSize: value } ) }
						min={ 60 }
						max={ 260 }
						__nextHasNoMarginBottom
					/>
					<ResponsiveRange
						label={ __( 'Ring gap', 'jif' ) }
						value={ ringGap }
						onChange={ ( value ) => setAttributes( { ringGap: value } ) }
						min={ 8 }
						max={ 100 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Typography', 'jif' ) } initialOpen={ false }>
					<TextControl
						label={ __( 'Font family', 'jif' ) }
						help={ __( 'Any valid CSS font-family value.', 'jif' ) }
						value={ fontFamily }
						onChange={ ( value ) => setAttributes( { fontFamily: value } ) }
						__nextHasNoMarginBottom
					/>
					<FontSizeControl
						label={ __( 'Label font size', 'jif' ) }
						value={ labelFontSize }
						onChange={ ( value ) => setAttributes( { labelFontSize: value } ) }
						min={ 10 }
						max={ 48 }
					/>
					<SelectControl
						label={ __( 'Label font weight', 'jif' ) }
						value={ labelFontWeight }
						options={ FONT_WEIGHTS }
						onChange={ ( value ) => setAttributes( { labelFontWeight: value } ) }
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelColorSettings
					title={ __( 'Color', 'jif' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							value: coreLabelColor,
							onChange: ( value ) => setAttributes( { coreLabelColor: value } ),
							label: __( 'Core label text', 'jif' ),
						},
						{
							value: ringLabelColor,
							onChange: ( value ) => setAttributes( { ringLabelColor: value } ),
							label: __( 'Ring label text', 'jif' ),
						},
						{
							value: backgroundColor,
							onChange: ( value ) => setAttributes( { backgroundColor: value } ),
							label: __( 'Label background', 'jif' ),
							help: __( 'The patch behind each ring label, so it covers the ring line cleanly.', 'jif' ),
						},
						{
							value: labelBorderColor,
							onChange: ( value ) => setAttributes( { labelBorderColor: value } ),
							label: __( 'Label border', 'jif' ),
						},
					] }
				/>

				<PanelBody title={ __( 'Label shape', 'jif' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Label border radius', 'jif' ) }
						help={ __( 'Round the label background’s corners; set high enough and it becomes a pill.', 'jif' ) }
						value={ labelBorderRadius }
						onChange={ ( value ) => setAttributes( { labelBorderRadius: value } ) }
						min={ 0 }
						max={ 40 }
						__nextHasNoMarginBottom
					/>
					<RangeControl
						label={ __( 'Label border width', 'jif' ) }
						value={ labelBorderWidth }
						onChange={ ( value ) => setAttributes( { labelBorderWidth: value } ) }
						min={ 0 }
						max={ 10 }
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={ __( 'Label border style', 'jif' ) }
						value={ labelBorderStyle }
						options={ BORDER_STYLES }
						onChange={ ( value ) => setAttributes( { labelBorderStyle: value } ) }
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ rings.map( ( ring, index ) => (
					<RingDisplay
						key={ index }
						ring={ ring }
						index={ index }
						onChangeLabel={ ( value ) => updateRing( index, { label: value } ) }
					/>
				) ) }
			</div>
		</>
	);
}

/**
 * One ring's diagram markup — its own component so useLabelDip's refs and
 * ResizeObserver are scoped per ring rather than shared across the map().
 */
function RingDisplay( { ring, index, onChangeLabel } ) {
	const isCore = index === 0;
	const ringRef = useRef();
	const labelRef = useRef();
	const textRef = useRef();

	useLabelDip( ringRef, labelRef, textRef, ! isCore );

	return (
		<div
			ref={ ringRef }
			className={ [ 'cz-ring-chart__ring', isCore ? 'is-core' : '' ].filter( Boolean ).join( ' ' ) }
			style={ buildRingStyleVars( ring, index ) }
		>
			<div ref={ labelRef } className="cz-ring-chart__label">
				<RichText
					ref={ textRef }
					tagName="span"
					className="cz-ring-chart__name"
					value={ ring.label }
					onChange={ onChangeLabel }
					placeholder={ __( 'Ring label…', 'jif' ) }
					allowedFormats={ [] }
				/>
			</div>
		</div>
	);
}
