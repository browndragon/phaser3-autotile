module.exports = {
    'env': {
        'browser': true,
        'es6': true,
        'node': true,
        'jest/globals': true,
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 9,
        'sourceType': 'module'
    },
    'rules': {
        'indent': [
            'error',
            4
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'no-unused-vars': [
            'error',
            {
                'argsIgnorePattern': '(^_)|([iI]gnore(d?))',
                'varsIgnorePattern': '(^_)|([iI]gnore(d?))',
                'caughtErrorsIgnorePattern': '(^_)|([iI]gnore(d?))'
            }
        ]
    },
    'plugins': ['jest']
};
