import { registerBlockType } from '@wordpress/blocks';
import { SVG, Circle } from '@wordpress/primitives';
import metadata from './block.json';
import edit from './edit';
import save from './save';
import './style.css';
import './editor.css';

const ringChartIcon = (
	<SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<Circle cx="12" cy="12" r="2.5" fill="currentColor" />
		<Circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
		<Circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
	</SVG>
);

registerBlockType( metadata.name, {
	...metadata,
	icon: ringChartIcon,
	edit,
	save,
} );
