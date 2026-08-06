import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	RichText,
	useBlockProps,
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
				__nextHasNoMarginBottom
			/>
		</div>
	);
}

export default function edit( { attributes, setAttributes } ) {
	const {
		beforeText,
		afterText,
		icon,
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
						onChange={ ( value ) => setAttributes( { icon: value } ) }
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
					<ResponsiveRange
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
					<ResponsiveRange
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
						tagName="div"
						className="cz-comparison-bar__before"
						value={ beforeText }
						onChange={ ( value ) => setAttributes( { beforeText: value } ) }
						placeholder={ __( 'Before…', 'jif' ) }
						allowedFormats={ [] }
					/>
					<div className="cz-comparison-bar__icon" aria-hidden="true">
						{ renderIcon( icon, { className: 'cz-comparison-bar__icon-svg' } ) }
					</div>
					<RichText
						tagName="div"
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
