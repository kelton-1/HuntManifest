import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "HuntManifest",
        short_name: 'HuntManifest',
        description: "Logistics. For Waterfowl. Created by Talkin' Timber",
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0f1a',
        theme_color: '#0B3D2E',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
