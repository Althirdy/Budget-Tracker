import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

let apiOrigin = 'http://localhost:8080';
try {
	apiOrigin = new URL(process.env.PUBLIC_API_BASE_URL || apiOrigin).origin;
} catch {
	// Keep the local development default.
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'connect-src': ['self', apiOrigin],
				'img-src': ['self', 'data:'],
				'font-src': ['self'],
				'frame-ancestors': ['none'],
				'base-uri': ['self'],
				'form-action': ['self']
			}
		}
	}
};

export default config;
