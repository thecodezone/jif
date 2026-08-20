import { useState } from '@wordpress/element';
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
	ColorPicker,
} from '@wordpress/components';
import { desktop, tablet, mobile, plus, trash } from '@wordpress/icons';
import { buildRingChartStyleVars, buildRingStyleVars } from './style-vars';

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

const DEFAULT_RING_COLORS = [
	'var(--theme-palette-color-1, #0c1488)',
	'#3049b0',
	'#7d93da',
	'#c5d7ff',
	'#e4ecff',
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
 * One row in the rings repeater — a color swatch (opens a ColorPicker
 * popover) plus a remove button; the label itself is edited inline on the
 * ring diagram via RichText, not here.
 */
function RingRow( { index, ring, onChangeColor, onRemove, canRemove } ) {
	return (
		<div className="cz-rc-ring-row">
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
					<ColorPicker
						color={ ring.color }
						onChange={ onChangeColor }
						enableAlpha={ false }
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
		eyebrowFontSize,
		labelFontWeight,
		fontFamily,
		coreLabelColor,
		ringLabelColor,
		backgroundColor,
	} = attributes;

	const updateRing = ( index, patch ) => {
		const next = rings.map( ( ring, i ) => ( i === index ? { ...ring, ...patch } : ring ) );
		setAttributes( { rings: next } );
	};

	const addRing = () => {
		if ( rings.length >= MAX_RINGS ) {
			return;
		}
		const color = DEFAULT_RING_COLORS[ rings.length ] ?? '#c5d7ff';
		setAttributes( { rings: [ ...rings, { label: __( 'New ring', 'jif' ), color } ] } );
	};

	const removeRing = ( index ) => {
		if ( rings.length <= MIN_RINGS ) {
			return;
		}
		setAttributes( { rings: rings.filter( ( _, i ) => i !== index ) } );
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
							onChangeColor={ ( color ) => updateRing( index, { color } ) }
							onRemove={ () => removeRing( index ) }
							canRemove={ rings.length > MIN_RINGS }
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
						{ __( 'Edit each label directly on the diagram. 2–5 rings; ring 1 is the innermost.', 'jif' ) }
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
					<FontSizeControl
						label={ __( 'Eyebrow font size', 'jif' ) }
						value={ eyebrowFontSize }
						onChange={ ( value ) => setAttributes( { eyebrowFontSize: value } ) }
						min={ 8 }
						max={ 24 }
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
							label: __( 'Page background', 'jif' ),
							help: __( 'The surface the diagram sits on, so outer-ring labels break the ring line cleanly.', 'jif' ),
						},
					] }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ rings.map( ( ring, index ) => {
					const isCore = index === 0;
					return (
						<div
							key={ index }
							className={ [ 'cz-ring-chart__ring', isCore ? 'is-core' : '' ].filter( Boolean ).join( ' ' ) }
							style={ buildRingStyleVars( ring, index ) }
						>
							<div className="cz-ring-chart__label">
								<span className="cz-ring-chart__eyebrow">
									{ sprintf( __( 'Ring %d', 'jif' ), index + 1 ) }
								</span>
								<RichText
									tagName="span"
									className="cz-ring-chart__name"
									value={ ring.label }
									onChange={ ( value ) => updateRing( index, { label: value } ) }
									placeholder={ __( 'Ring label…', 'jif' ) }
									allowedFormats={ [] }
								/>
							</div>
						</div>
					);
				} ) }
			</div>
		</>
	);
}
