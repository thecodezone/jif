import { registerBlockType } from '@wordpress/blocks';
import { arrowRight } from '@wordpress/icons';
import metadata from './block.json';
import edit from './edit';
import save from './save';
import deprecated from './deprecated';
import './style.css';
import './editor.css';

registerBlockType( metadata.name, {
	...metadata,
	icon: arrowRight,
	edit,
	save,
	deprecated,
} );
