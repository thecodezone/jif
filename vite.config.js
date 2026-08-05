import { v4wp } from '@kucrut/vite-for-wp';
import { defineConfig } from 'vite';

export default defineConfig( {
	plugins: [
		v4wp( {
			input: 'resources/js/app.js',
			outDir: 'assets/build',
		} ),
	],
	server: {
		cors: true,
	},
} );
