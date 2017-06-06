module.exports = {
    source: 'src',
    dist: 'dist',
    targets: [
        {
            name: "web",
            babel: {
                presets: [
                    [
                        'env',
                        {
                            modules: false,
                            exclude: ['transform-regenerator'],
                            targets: {
                                browsers: [
                                    '> 1%',
                                    'last 2 Firefox versions',
                                    'last 2 Chrome versions',
                                    'last 2 Edge versions',
                                    'last 2 Safari versions',
                                    'Firefox ESR',
                                    'IE >= 8',
                                ]
                            }
                        }
                    ]
                ]

            }
        },
        {
            name: "node",
            babel: {
                presets: [
                    [
                        'env',
                        {
                            exclude: ['transform-regenerator'],
                            targets: {
                                node: '6.0'
                            }
                        }
                    ]
                ]
            }
        }
    ],
    babel: {
        plugins: [
            'transform-react-jsx',
            'transform-class-properties',
            'syntax-object-rest-spread',
            'transform-object-rest-spread',
        ]
    }
};