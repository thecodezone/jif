import { v4wp } from '@kucrut/vite-for-wp';
import { wp_scripts } from '@kucrut/vite-for-wp/plugins';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig( async () => ( {
	plugins: [
		v4wp( {
			input: {
				app: 'resources/js/app.js',
				critical: 'resources/css/critical.css',
				tokens: 'resources/css/tokens.css',
				'comparison-bar': 'resources/blocks/comparison-bar/index.jsx',
				'comparison-bar-frontend': 'resources/blocks/comparison-bar/frontend.css',
			},
			outDir: 'assets/build',
		} ),
		...( await wp_scripts() ),
		react(),
	],
	server: {
		cors: true,
	},
} ) );
