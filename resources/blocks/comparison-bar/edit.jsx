import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	RichText,
	URLInput,
	useBlockProps,
	useSettings,
	InspectorControls,
	PanelColorSettings,
} from '@wordpress/block-editor';
import {
	BaseControl,
	PanelBody,
	ToggleControl,
	RangeControl,
	SelectControl,
	TextControl,
	ButtonGroup,
	Button,
} from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import { renderIcon } from './icons';
import { IconPicker } from './icon-picker';
import { buildBarStyleVars } from './style-vars';

const DEVICES = [
	{ key: 'desktop', label: __( 'Desktop', 'jif' ), icon: desktop },
	{ key: 'tablet', label: __( 'Tablet', 'jif' ), icon: tablet },
	{ key: 'mobile', label: __( 'Mobile', 'jif' ), icon: mobile },
];

const FONT_FAMILIES = [
	{ label: __( 'Theme default (sans)', 'jif' ), value: 'var(--theme-font-family)' },
	{ label: __( 'Serif', 'jif' ), value: 'var(--font-serif)' },
	{ label: __( 'Custom…', 'jif' ), value: 'custom' },
];

const FONT_WEIGHTS = [
	{ label: 'Regular (400)', value: '400' },
	{ label: 'Medium (500)', value: '500' },
	{ label: 'Semibold (600)', value: '600' },
	{ label: 'Bold (700)', value: '700' },
	{ label: 'Extrabold (800)', value: '800' },
	{ label: 'Black (900)', value: '900' },
];

function ResponsiveRange( { label, value, onChange, min, max, step } ) {
	const [ device, setDevice ] = useState( 'desktop' );

	return (
		<div className="cz-cb-responsive-control">
			<div className="cz-cb-responsive-control__header">
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
		<div className="cz-cb-font-size-control">
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

export default function edit( { attributes, setAttributes } ) {
	const {
		beforeText,
		afterText,
		beforeUrl,
		afterUrl,
		icon,
		iconStyle,
		iconColor,
		iconSize,
		beforeColor,
		afterColor,
		beforeFontSize,
		afterFontSize,
		beforeFontWeight,
		afterFontWeight,
		fontFamily,
		backgroundColor,
		borderColor,
		borderWidth,
		borderRadius,
		padding,
		stackOnMobile,
	} = attributes;

	const blockProps = useBlockProps( {
		className: [ 'cz-comparison-bar', stackOnMobile ? 'is-stacked-mobile' : '' ]
			.filter( Boolean )
			.join( ' ' ),
		style: buildBarStyleVars( attributes ),
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'jif' ) } initialOpen>
					<ToggleControl
						label={ __( 'Stack before/after on mobile', 'jif' ) }
						checked={ stackOnMobile }
						onChange={ ( value ) => setAttributes( { stackOnMobile: value } ) }
						__nextHasNoMarginBottom
					/>
					<IconPicker
						label={ __( 'Icon', 'jif' ) }
						value={ icon }
						style={ iconStyle }
						onChange={ ( value ) => setAttributes( { icon: value } ) }
						onStyleChange={ ( value ) => setAttributes( { iconStyle: value } ) }
					/>
					<ResponsiveRange
						label={ __( 'Icon size', 'jif' ) }
						value={ iconSize }
						onChange={ ( value ) => setAttributes( { iconSize: value } ) }
						min={ 12 }
						max={ 160 }
					/>
					<ResponsiveRange
						label={ __( 'Padding', 'jif' ) }
						value={ padding }
						onChange={ ( value ) => setAttributes( { padding: value } ) }
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label={ __( 'Border width', 'jif' ) }
						value={ borderWidth }
						onChange={ ( value ) => setAttributes( { borderWidth: value } ) }
						min={ 0 }
						max={ 12 }
						__nextHasNoMarginBottom
					/>
					<RangeControl
						label={ __( 'Border radius', 'jif' ) }
						value={ borderRadius }
						onChange={ ( value ) => setAttributes( { borderRadius: value } ) }
						min={ 0 }
						max={ 60 }
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={ __( 'Links', 'jif' ) } initialOpen={ false }>
					<BaseControl __nextHasNoMarginBottom>
						<BaseControl.VisualLabel>{ __( '"Before" link', 'jif' ) }</BaseControl.VisualLabel>
						<URLInput
							value={ beforeUrl }
							onChange={ ( value ) => setAttributes( { beforeUrl: value ?? '' } ) }
						/>
					</BaseControl>
					<BaseControl __nextHasNoMarginBottom>
						<BaseControl.VisualLabel>{ __( '"After" link', 'jif' ) }</BaseControl.VisualLabel>
						<URLInput
							value={ afterUrl }
							onChange={ ( value ) => setAttributes( { afterUrl: value ?? '' } ) }
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody title={ __( 'Typography', 'jif' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Typeface', 'jif' ) }
						value={ FONT_FAMILIES.some( ( f ) => f.value === fontFamily ) ? fontFamily : 'custom' }
						options={ FONT_FAMILIES }
						onChange={ ( value ) =>
							setAttributes( { fontFamily: value === 'custom' ? '' : value } )
						}
						__nextHasNoMarginBottom
					/>
					{ ! FONT_FAMILIES.some( ( f ) => f.value === fontFamily && f.value !== 'custom' ) && (
						<TextControl
							label={ __( 'Custom font family', 'jif' ) }
							help={ __( 'Any valid CSS font-family value, e.g. "Georgia, serif".', 'jif' ) }
							value={ fontFamily }
							onChange={ ( value ) => setAttributes( { fontFamily: value } ) }
							__nextHasNoMarginBottom
						/>
					) }
					<FontSizeControl
						label={ __( '"Before" font size', 'jif' ) }
						value={ beforeFontSize }
						onChange={ ( value ) => setAttributes( { beforeFontSize: value } ) }
						min={ 10 }
						max={ 48 }
					/>
					<SelectControl
						label={ __( '"Before" font weight', 'jif' ) }
						value={ beforeFontWeight }
						options={ FONT_WEIGHTS }
						onChange={ ( value ) => setAttributes( { beforeFontWeight: value } ) }
						__nextHasNoMarginBottom
					/>
					<FontSizeControl
						label={ __( '"After" font size', 'jif' ) }
						value={ afterFontSize }
						onChange={ ( value ) => setAttributes( { afterFontSize: value } ) }
						min={ 10 }
						max={ 48 }
					/>
					<SelectControl
						label={ __( '"After" font weight', 'jif' ) }
						value={ afterFontWeight }
						options={ FONT_WEIGHTS }
						onChange={ ( value ) => setAttributes( { afterFontWeight: value } ) }
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelColorSettings
					title={ __( 'Color', 'jif' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							value: beforeColor,
							onChange: ( value ) => setAttributes( { beforeColor: value } ),
							label: __( '"Before" text', 'jif' ),
						},
						{
							value: afterColor,
							onChange: ( value ) => setAttributes( { afterColor: value } ),
							label: __( '"After" text', 'jif' ),
						},
						{
							value: iconColor,
							onChange: ( value ) => setAttributes( { iconColor: value } ),
							label: __( 'Icon', 'jif' ),
						},
						{
							value: backgroundColor,
							onChange: ( value ) => setAttributes( { backgroundColor: value } ),
							label: __( 'Background', 'jif' ),
						},
						{
							value: borderColor,
							onChange: ( value ) => setAttributes( { borderColor: value } ),
							label: __( 'Border', 'jif' ),
						},
					] }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="cz-comparison-bar__inner">
					<RichText
						tagName={ beforeUrl ? 'a' : 'div' }
						href={ beforeUrl ? beforeUrl : undefined }
						className="cz-comparison-bar__before"
						value={ beforeText }
						onChange={ ( value ) => setAttributes( { beforeText: value } ) }
						placeholder={ __( 'Before…', 'jif' ) }
						allowedFormats={ [] }
					/>
					<div className="cz-comparison-bar__icon" aria-hidden="true">
						{ renderIcon( icon, iconStyle, { className: 'cz-comparison-bar__icon-svg' } ) }
					</div>
					<RichText
						tagName={ afterUrl ? 'a' : 'div' }
						href={ afterUrl ? afterUrl : undefined }
						className="cz-comparison-bar__after"
						value={ afterText }
						onChange={ ( value ) => setAttributes( { afterText: value } ) }
						placeholder={ __( 'After…', 'jif' ) }
						allowedFormats={ [] }
					/>
				</div>
			</div>
		</>
	);
}
