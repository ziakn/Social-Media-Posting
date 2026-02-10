export const PLATFORM_CAPABILITIES = {
    facebook: {
        allowedTypes: ['image', 'video'],
        maxItems: 10,
        allowMixed: true,
        maxCaption: 5000,
        label: 'Facebook'
    },
    instagram: {
        allowedTypes: ['image', 'video'],
        maxItems: 20, // Carousel limit
        allowMixed: true,
        maxCaption: 2200,
        label: 'Instagram'
    },
    linkedin: {
        allowedTypes: ['image', 'video'],
        maxItems: 9,
        allowMixed: false, // LinkedIn API usually prefers one type per post
        maxCaption: 3000,
        label: 'LinkedIn'
    },
    twitter: {
        allowedTypes: ['image', 'video'],
        maxItems: 4,
        allowMixed: false,
        maxCaption: 280,
        label: 'X (Twitter)'
    },
    threads: {
        allowedTypes: ['image', 'video'],
        maxItems: 10,
        allowMixed: true,
        maxCaption: 500,
        label: 'Threads'
    },
    tiktok: {
        allowedTypes: ['video'],
        maxItems: 1,
        allowMixed: false,
        maxCaption: 2200,
        label: 'TikTok'
    },
    youtube: {
        allowedTypes: ['video'],
        maxItems: 1,
        allowMixed: false,
        maxCaption: 5000,
        label: 'YouTube'
    },
    pinterest: {
        allowedTypes: ['image', 'video'],
        maxItems: 1,
        allowMixed: false,
        maxCaption: 500,
        label: 'Pinterest'
    },
    default: {
        allowedTypes: ['image', 'video'],
        maxItems: 10,
        allowMixed: true,
        maxCaption: 2200,
        label: 'Social'
    }
};
