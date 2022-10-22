import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

import { resolve } from 'path';

const config: UserConfig = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'$components': resolve('src/components'),
			'$routes': resolve('src/routes'),
			'$stores': resolve('src/stores'),
			'$styles': resolve('src/styles')
		}
	}
};

export default config;
