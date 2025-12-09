export const featuredItem = {
    id: 'flux-pro',
    title: 'FLUX.1 [pro]',
    description: 'Black Forest Labs most advanced image generation model yet. Delivers realistic high-resolution images with consistent details.',
    type: 'Model',
    tags: ['Image Generation', 'Professional'],
    author: 'Black Forest Labs',
    status: 'Operational',
    price: '$0.05/run',
    runCount: '2.1M',
    coverImage: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=2940&auto=format&fit=crop',
    configFields: [
        { name: 'prompt', type: 'textarea', label: 'Prompt', required: true, defaultValue: 'A futuristic city...' },
        { name: 'aspect_ratio', type: 'select', label: 'Aspect Ratio', options: ['1:1', '16:9', '9:16', '3:2'], defaultValue: '1:1' },
    ],
    examples: [
        { prompt: 'Cyberpunk street', image: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=400' },
        { prompt: 'Portrait of a woman', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400' }
    ]
};

export const popularModels = [
    {
        id: 'nano-banana',
        title: 'Nano-banana',
        description: 'Nano-banana is a specialized image generation model based on gemini-2.5-flash-image-preview, optimized for drawing. It supports DALL-E format, returns URLs, does not charge for failures, and allows aspect ratio customization.',
        type: 'Model',
        author: 'Agent Platform',
        status: 'Operational',
        price: '$0.002/run',
        runCount: '150k',
        tags: ['Image Gen', 'Fast', 'Cheap'],
        coverImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop',
        configFields: [
            {
                name: 'prompt',
                type: 'textarea',
                label: 'Prompt',
                description: 'The text prompt for image generation.',
                required: true,
                defaultValue: 'A cute cat'
            },
            {
                name: 'model',
                type: 'text',
                label: 'Model',
                description: 'Model identifier.',
                required: true,
                defaultValue: 'nano-banana',
                disabled: true
            },
            {
                name: 'aspect_ratio',
                type: 'select',
                label: 'Aspect Ratio',
                description: 'The aspect ratio of the generated image.',
                options: ['4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '1:1', '4:5', '5:4', '21:9'],
                defaultValue: '4:3'
            },
            {
                name: 'response_format',
                type: 'select',
                label: 'Response Format',
                description: 'Return format: url or b64_json.',
                options: ['url', 'b64_json'],
                defaultValue: 'url'
            },
            {
                name: 'image_size',
                type: 'select',
                label: 'Image Size',
                description: 'Resolution of the generated image (Only for nano-banana-2).',
                options: ['1K', '2K', '4K'],
                defaultValue: '1K'
            },
            {
                name: 'image', // simplified for UI as a single URL input for now
                type: 'text',
                label: 'Reference Image URL',
                description: 'Optional reference image URL.',
                placeholder: 'https://example.com/image.jpg'
            }
        ],
        examples: [
            { prompt: 'A golden banana in space', image: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400' },
            { prompt: 'Abstract nano structures', image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400' },
            { prompt: 'Cartoon monkey', image: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=400' }
        ]
    },
    {
        id: 'kokoro-82m',
        title: 'kokoro-82m',
        description: 'Kokoro v1.0 - text-to-speech (82M params, based on StyleTTS2)',
        type: 'Model',
        author: 'jaaari',
        status: 'Crowded',
        price: 'Free',
        runCount: '66.3m',
        tags: ['Audio', 'TTS'],
        coverImage: 'https://images.unsplash.com/photo-1614728263952-84ea2563bcfe?w=800&auto=format&fit=crop',
        configFields: [],
        examples: []
    },
    {
        id: 'clip-features',
        title: 'clip-features',
        description: 'Return CLIP features for the clip-vit-large-patch14 model',
        type: 'Model',
        author: 'andreasjansson',
        status: 'Operational',
        price: '$0.001/run',
        runCount: '125m',
        tags: ['Vision', 'CLIP'],
        configFields: [],
        examples: []
    },
    {
        id: 'flux-dev',
        title: 'FLUX.1 [dev]',
        description: 'Open source image generation model for developers',
        type: 'Model',
        author: 'black-forest-labs',
        status: 'Operational',
        price: '$0.03/run',
        runCount: '18.5m',
        tags: ['Image Gen', 'Dev'],
        configFields: [],
        examples: []
    }
];

export const recommendedWorkflows = [
    {
        id: 'product-showcase',
        title: 'Product Showcase',
        description: 'Create professional product photography from simple shots.',
        type: 'Workflow',
        author: 'Agent Platform',
        status: 'Operational',
        price: '$0.10/run',
        runCount: '450k',
        coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
        configFields: [],
        examples: []
    },
    {
        id: 'video-ad-gen',
        title: 'Video Ad Generator',
        description: 'Generate 15s social media ads from text descriptions.',
        type: 'Workflow',
        author: 'Agent Platform',
        status: 'Operational',
        price: '$0.50/run',
        runCount: '120k',
        coverImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop',
        configFields: [],
        examples: []
    },
    {
        id: 'avatar-creator',
        title: '3D Avatar Creator',
        description: 'Turn selfies into 3D stylized avatars.',
        type: 'Workflow',
        author: 'Community',
        status: 'Maintenance',
        price: 'Free',
        runCount: '890k',
        coverImage: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop',
        configFields: [],
        examples: []
    }
];
