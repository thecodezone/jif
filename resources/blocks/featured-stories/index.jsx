import { registerBlockType } from '@wordpress/blocks';
import { postList } from '@wordpress/icons';
import metadata from './block.json';
import edit from './edit';
import './style.css';
import './editor.css';

registerBlockType( metadata.name, {
	...metadata,
	icon: postList,
	edit,
	save: () => null,
} );
