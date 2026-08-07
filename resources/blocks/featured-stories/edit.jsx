import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	PanelColorSettings,
} from '@wordpress/block-editor';
import {
	BaseControl,
	PanelBody,
	QueryControls,
	RangeControl,
	SelectControl,
	TextControl,
	ButtonGroup,
	Button,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { desktop, tablet, mobile } from '@wordpress/icons';
import ServerSideRender from '@wordpress/server-side-render';

const DEVICES = [
	{ key: 'desktop', label: __( 'Desktop', 'jif' ), icon: desktop },
	{ key: 'tablet', label: __( 'Tablet', 'jif' ), icon: tablet },
	{ key: 'mobile', label: __( 'Mobile', 'jif' ), icon: mobile },
];

const FONT_FAMILIES = [
	{ label: __( 'Serif', 'jif' ), value: 'var(--font-serif)' },
	{ label: __( 'Theme default (sans)', 'jif' ), value: 'var(--theme-font-family)' },
	{ label: __( 'Custom…', 'jif' ), value: 'custom' },
];

const FONT_WEIGHTS = [
	{ label: 'Regular (400)', value: '400' },
	{ label: 'Medium (500)', value: '500' },
	{ label: 'Semibold (600)', value: '600' },
	{ label: 'Bold (700)', value: '700' },
	{ label: 'Extrabold (800)', value: '800' },
];

function FontFamilyControl( { label, value, onChange } ) {
	const isKnown = FONT_FAMILIES.some( ( f ) => f.value === value );

	return (
		<>
			<SelectControl
				label={ label }
				value={ isKnown ? value : 'custom' }
				options={ FONT_FAMILIES }
				onChange={ ( next ) => onChange( next === 'custom' ? '' : next ) }
				__nextHasNoMarginBottom
			/>
			{ ! isKnown && (
				<TextControl
					label={ __( 'Custom font family', 'jif' ) }
					help={ __( 'Any valid CSS font-family value, e.g. "Georgia, serif".', 'jif' ) }
					value={ value }
					onChange={ onChange }
					__nextHasNoMarginBottom
				/>
			) }
		</>
	);
}

function ResponsiveRange( { label, value, onChange, min, max, step } ) {
	const [ device, setDevice ] = useState( 'desktop' );

	return (
		<div className="cz-fs-responsive-control">
			<div className="cz-fs-responsive-control__header">
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
		postsToShow,
		categoryId,
		order,
		orderBy,
		excerptLength,
		minCardWidth,
		gridGap,
		cardPadding,
		imageAspectRatio,
		borderWidth,
		borderRadius,
		titleFontFamily,
		bodyFontFamily,
		uiFontFamily,
		titleFontSize,
		titleFontWeight,
		excerptFontSize,
		metaFontSize,
		badgeFontSize,
		backgroundColor,
		borderColor,
		mediaBackgroundColor,
		mediaIconColor,
		badgeBackgroundColor,
		badgeTextColor,
		titleColor,
		excerptColor,
		metaColor,
		linkColor,
		linkHoverColor,
	} = attributes;

	const categories = useSelect(
		( select ) =>
			select( 'core' ).getEntityRecords( 'taxonomy', 'category', {
				per_page: -1,
				orderby: 'name',
				order: 'asc',
			} ),
		[]
	);

	const categorySuggestions = ( categories ?? [] ).map( ( term ) => ( {
		label: term.name,
		value: term.id,
	} ) );

	const blockProps = useBlockProps();

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Query', 'jif' ) } initialOpen>
					<QueryControls
						numberOfItems={ postsToShow }
						onNumberOfItemsChange={ ( value ) => setAttributes( { postsToShow: value } ) }
						minItems={ 1 }
						maxItems={ 12 }
						orderBy={ orderBy }
						onOrderByChange={ ( value ) => setAttributes( { orderBy: value } ) }
						order={ order }
						onOrderChange={ ( value ) => setAttributes( { order: value } ) }
						categorySuggestions={ categorySuggestions }
						selectedCategoryId={ categoryId || undefined }
						onCategoryChange={ ( value ) =>
							setAttributes( { categoryId: value ? Number( value ) : 0 } )
						}
					/>
					<RangeControl
						label={ __( 'Excerpt length (words)', 'jif' ) }
						value={ excerptLength }
						onChange={ ( value ) => setAttributes( { excerptLength: value } ) }
						min={ 5 }
						max={ 60 }
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody title={ __( 'Layout', 'jif' ) } initialOpen={ false }>
					<ResponsiveRange
						label={ __( 'Minimum card width', 'jif' ) }
						value={ minCardWidth }
						onChange={ ( value ) => setAttributes( { minCardWidth: value } ) }
						min={ 200 }
						max={ 480 }
						step={ 10 }
					/>
					<ResponsiveRange
						label={ __( 'Grid gap', 'jif' ) }
						value={ gridGap }
						onChange={ ( value ) => setAttributes( { gridGap: value } ) }
						min={ 0 }
						max={ 64 }
					/>
					<RangeControl
						label={ __( 'Card padding', 'jif' ) }
						value={ cardPadding }
						onChange={ ( value ) => setAttributes( { cardPadding: value } ) }
						min={ 0 }
						max={ 60 }
						__nextHasNoMarginBottom
					/>
					<SelectControl
						label={ __( 'Image aspect ratio', 'jif' ) }
						value={ imageAspectRatio }
						options={ [
							{ label: '16 / 10', value: '16 / 10' },
							{ label: '16 / 9', value: '16 / 9' },
							{ label: '4 / 3', value: '4 / 3' },
							{ label: '1 / 1', value: '1 / 1' },
						] }
						onChange={ ( value ) => setAttributes( { imageAspectRatio: value } ) }
						__nextHasNoMarginBottom
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
					<FontFamilyControl
						label={ __( 'Title typeface', 'jif' ) }
						value={ titleFontFamily }
						onChange={ ( value ) => setAttributes( { titleFontFamily: value } ) }
					/>
					<FontFamilyControl
						label={ __( 'Excerpt typeface', 'jif' ) }
						value={ bodyFontFamily }
						onChange={ ( value ) => setAttributes( { bodyFontFamily: value } ) }
					/>
					<FontFamilyControl
						label={ __( 'Meta / badge / link typeface', 'jif' ) }
						value={ uiFontFamily }
						onChange={ ( value ) => setAttributes( { uiFontFamily: value } ) }
					/>
					<ResponsiveRange
						label={ __( 'Title font size', 'jif' ) }
						value={ titleFontSize }
						onChange={ ( value ) => setAttributes( { titleFontSize: value } ) }
						min={ 14 }
						max={ 36 }
					/>
					<SelectControl
						label={ __( 'Title font weight', 'jif' ) }
						value={ titleFontWeight }
						options={ FONT_WEIGHTS }
						onChange={ ( value ) => setAttributes( { titleFontWeight: value } ) }
						__nextHasNoMarginBottom
					/>
					<ResponsiveRange
						label={ __( 'Excerpt font size', 'jif' ) }
						value={ excerptFontSize }
						onChange={ ( value ) => setAttributes( { excerptFontSize: value } ) }
						min={ 11 }
						max={ 22 }
					/>
					<ResponsiveRange
						label={ __( 'Meta text font size', 'jif' ) }
						value={ metaFontSize }
						onChange={ ( value ) => setAttributes( { metaFontSize: value } ) }
						min={ 10 }
						max={ 18 }
					/>
					<RangeControl
						label={ __( 'Category badge font size', 'jif' ) }
						value={ badgeFontSize }
						onChange={ ( value ) => setAttributes( { badgeFontSize: value } ) }
						min={ 10 }
						max={ 20 }
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelColorSettings
					title={ __( 'Color', 'jif' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							value: backgroundColor,
							onChange: ( value ) => setAttributes( { backgroundColor: value } ),
							label: __( 'Card background', 'jif' ),
						},
						{
							value: borderColor,
							onChange: ( value ) => setAttributes( { borderColor: value } ),
							label: __( 'Card border', 'jif' ),
						},
						{
							value: mediaBackgroundColor,
							onChange: ( value ) => setAttributes( { mediaBackgroundColor: value } ),
							label: __( 'Image placeholder background', 'jif' ),
						},
						{
							value: mediaIconColor,
							onChange: ( value ) => setAttributes( { mediaIconColor: value } ),
							label: __( 'Image placeholder icon', 'jif' ),
						},
						{
							value: badgeBackgroundColor,
							onChange: ( value ) => setAttributes( { badgeBackgroundColor: value } ),
							label: __( 'Category badge background', 'jif' ),
						},
						{
							value: badgeTextColor,
							onChange: ( value ) => setAttributes( { badgeTextColor: value } ),
							label: __( 'Category badge text', 'jif' ),
						},
						{
							value: titleColor,
							onChange: ( value ) => setAttributes( { titleColor: value } ),
							label: __( 'Title', 'jif' ),
						},
						{
							value: excerptColor,
							onChange: ( value ) => setAttributes( { excerptColor: value } ),
							label: __( 'Excerpt', 'jif' ),
						},
						{
							value: metaColor,
							onChange: ( value ) => setAttributes( { metaColor: value } ),
							label: __( 'Meta text (date / reading time)', 'jif' ),
						},
						{
							value: linkColor,
							onChange: ( value ) => setAttributes( { linkColor: value } ),
							label: __( '"Read more" link', 'jif' ),
						},
						{
							value: linkHoverColor,
							onChange: ( value ) => setAttributes( { linkHoverColor: value } ),
							label: __( '"Read more" link (hover)', 'jif' ),
						},
					] }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<ServerSideRender block="cz/featured-stories" attributes={ attributes } />
			</div>
		</>
	);
}
