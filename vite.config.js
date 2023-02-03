import legacy from '@vitejs/plugin-legacy';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

export default {
    server: {
        open: './src/index.html',
        port: 8080,
        strictPort: true,
        watch: './src/*',
    },
    plugins: [
        legacy({
            targets: ['defaults', 'not IE 11'],
        }),
        VitePWA({
            registerType: 'autoUpdate',
        }),
    ],
};
