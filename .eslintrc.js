module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: [
        'plugin:react/recommended',
        'standard'
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    plugins: [
        'react'
    ],
    rules: {
        "accessor-pairs": "error",
        "array-bracket-spacing": [
            "error",
            "never"
        ],
        "array-callback-return": "error",
        "arrow-body-style": "off",
        "arrow-parens": "off",
        "arrow-spacing": "off",
        "block-scoped-var": "error",
        "block-spacing": "off",
        "brace-style": "off",
        "callback-return": "off",
        "camelcase": "off",
        "class-methods-use-this": "off",
        "comma-dangle": [
            "error",
            "only-multiline"
        ],
        "comma-spacing": "off",
        "comma-style": "off",
        "complexity": "off",
        "computed-property-spacing": [
            "error",
            "never"
        ],
        "consistent-return": "error",
        "consistent-this": "off",
        "curly": ["error", "multi-line", "consistent"],
        "default-case": "off",
        "dot-location": [
            "error",
            "property"
        ],
        "dot-notation": "off", // I like dot notation but it's probably not worth warninining about
        "eol-last": "off",
        "eqeqeq": "off", // not a bad idea, but there's too many...
        "func-call-spacing": "error",
        "func-names": "off",
        "func-style": "off",
        "generator-star-spacing": ["error", {"before": false, "after": true}], // MDN puts the * immediately after `function`: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Statements/function*
        "global-require": "off",
        "guard-for-in": "warn",
        "handle-callback-err": ["error", "^([Ee]rr(or)?([^a-z].*)?|.*(.E|[^a-z]e)rr(or)?)$"],
        "id-blacklist": "off",
        "id-length": "off",
        "id-match": "off",
        "indent": ["error", 4, {"SwitchCase": 1}],
        "init-declarations": "off",
        "jsx-quotes": ["error", "prefer-double"],
        "key-spacing": "error", // https://github.com/eslint/eslint/issues/7318
        "keyword-spacing": ["error", {
            "overrides": {
                "if": {"after": false},
                "for": {"after": false},
                "while": {"after": false},
                "switch": {"after": false},
                "catch": {"after": false},
            }
        }],
        "linebreak-style": ["error", "unix"],
        "lines-around-comment": "off",
        "max-depth": "off",
        "max-len": "off",
        "max-lines": "off",
        "max-nested-callbacks": "error",
        "max-params": "off",
        "max-statements": "off",
        "max-statements-per-line": "off",
        "multiline-ternary": "off",
        "new-parens": "off",
        "newline-after-var": "off",
        "newline-before-return": "off",
        "newline-per-chained-call": ["error", {"ignoreChainWithDepth": 5}],
        "no-alert": "warn",
        "no-array-constructor": "error",
        "no-bitwise": "off",
        "no-caller": "error",
        "no-catch-shadow": "off",
        "no-confusing-arrow": ["off", {"allowParens": true}],
        "no-constant-condition": [
            "error",
            {
                "checkLoops": true
            }
        ],
        "no-continue": "warn",
        "no-div-regex": "off",
        "no-duplicate-imports": ["error", {"includeExports": true}],
        "no-else-return": "off", // sometimes the elses add clarity I think
        "no-empty-function": "off",
        "no-eq-null": "off",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-extra-bind": "error",
        "no-extra-label": "error",
        "no-extra-parens": "off",
        "no-floating-decimal": "off",
        "no-global-assign": "error",
        "no-implicit-coercion": "off",
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-inline-comments": "off",
        "no-invalid-this": "off", // would be nice, but jQuery uses `this` excessively
        "no-iterator": "error",
        "no-label-var": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-lonely-if": "warn",
        "no-loop-func": "error",
        "no-magic-numbers": "off",
        "no-mixed-operators": [
            "error",
            {
                "groups": [
                    // ["+", "-", "*", "/", "%", "**"], // order of operations on math operators is pretty well understood, no need to flag these as an error
                    ["&", "|", "^", "~", "<<", ">>", ">>>"],
                    ["==", "!=", "===", "!==", ">", ">=", "<", "<="],
                    ["&&", "||"],
                    ["in", "instanceof"]
                ],
                "allowSamePrecedence": true
            }
        ],
        "no-mixed-requires": "error",
        "no-multi-spaces": ["error", {
            "ignoreEOLComments": true,
        }],
        "no-multi-str": "off",
        "no-multiple-empty-lines": ["warn", {"max": 2}],
        "no-negated-condition": "off", // hrmmm...
        "no-nested-ternary": "off", // too hard to avoid ternaries in react
        "no-new": "error",
        "no-new-func": "error",
        "no-new-object": "error",
        "no-new-require": "error",
        "no-new-wrappers": "error",
        "no-octal-escape": "error",
        "no-param-reassign": "off", // hrmm...
        "no-path-concat": "warn",
        "no-plusplus": "off",
        "no-process-env": "off",
        "no-process-exit": "error",
        "no-proto": "error",
        "no-prototype-builtins": "warn",
        "no-restricted-globals": "error",
        "no-restricted-imports": "error",
        "no-restricted-modules": "error",
        "no-restricted-syntax": "error",
        "no-return-assign": [
            "error",
            "always"
        ],
        "no-script-url": "error",
        "no-self-compare": "error",
        "no-sequences": "warn",
        "no-shadow": "warn",
        "no-shadow-restricted-names": "error",
        "no-sync": "warn",
        "no-tabs": "error",
        "no-template-curly-in-string": "warn",
        "no-ternary": "off",
        "no-throw-literal": "error",
        "no-trailing-spaces": "off",
        "no-undef-init": "off",
        "no-undefined": "off",
        "no-underscore-dangle": "off",
        "no-unmodified-loop-condition": "error",
        "no-unneeded-ternary": "error",
        "no-unsafe-negation": "error",
        "no-unused-expressions": "error",
        "no-unused-vars": ["warn", {
            argsIgnorePattern: "^_", // http://eslint.org/docs/rules/no-unused-vars#argsignorepattern
            args: "none",
            caughtErrorsIgnorePattern: "^_",
            ignoreRestSiblings: true,
        }],
        "no-use-before-define": ["error", "nofunc"],
        "no-useless-call": "error",
        "no-useless-computed-key": "error",
        "no-useless-concat": "error",
        "no-useless-constructor": "error",
        "no-useless-escape": "warn",
        "no-useless-rename": "error",
        "no-var": "warn",
        "no-void": "error",
        "no-warning-comments": "off",
        "no-whitespace-before-property": "error",
        "no-with": "error",
        "object-curly-newline": "off", // couldn't get this to behave the way I wanted
        "object-curly-spacing": "off",
        "object-property-newline": ["error", {"allowMultiplePropertiesPerLine": true}],
        "object-shorthand": "off",
        "one-var": "off",
        "one-var-declaration-per-line": ["error", "initializations"],
        "operator-assignment": "off",
        "operator-linebreak": ["warn", "before", {"overrides": {"?": "ignore", ":": "ignore", "&&": "ignore"}}], // { "overrides": { "?": "ignore", ":": "ignore" } }
        "padded-blocks": "off",
        "prefer-arrow-callback": "off",
        "prefer-const": "off",
        "prefer-reflect": "off",
        "prefer-rest-params": "off", // rest params are nice, but not necessary
        "prefer-spread": "warn",
        "prefer-template": "off",
        "quote-props": ["error", "consistent"],
        "quotes": "off",
        "radix": "off",
        "require-jsdoc": "off", // there's too many
        // "require-jsdoc": ["warn", {
        //     "require": {
        //         "FunctionDeclaration": true,
        //         "MethodDefinition": false,
        //         "ClassDeclaration": false
        //     }
        // }],
        "rest-spread-spacing": [
            "error",
            "never"
        ],
        "semi": [2, "always"],
        "semi-spacing": "off",
        "sort-imports": "off",
        "sort-keys": "off",
        "sort-vars": "off",
        "space-before-blocks": "off",
        "space-before-function-paren": "off",
        "space-in-parens": "off",
        "space-infix-ops": "off",
        "space-unary-ops": [
            "error",
            {
                "words": false,
                "nonwords": false
            }
        ],
        "spaced-comment": "off",
        "strict": "off",
        "symbol-description": "error",
        "template-curly-spacing": [
            "error",
            "never"
        ],
        "unicode-bom": [
            "error",
            "never"
        ],
        "valid-jsdoc": ["warn", {
            "requireReturn": false,
            "requireReturnType": true,
            "requireParamDescription": false,
            "requireReturnDescription": false,
            // "matchDescription": "[A-Za-z]"
        }],
        "vars-on-top": "warn",
        "wrap-iife": "off",
        "wrap-regex": "off",
        "yield-star-spacing": ["error", "after"],
        "yoda": ["warn", "never"],
        "no-console": ["off", {allow: ["warn", "error"]}], // disabled because they'll be stripped anyway
        "no-dupe-keys": "error",
        "react/react-in-jsx-scope": "off", // webpack will auto-import React as needed (ProvidePlugin)
        "react/jsx-no-duplicate-props": "error",
        "react/jsx-no-undef": "error",
        "react/prop-types": "off", // disabled because it doesn't work with createComponent
        "react/display-name": "off", // also doesn't work with createComponent
        "react/forbid-prop-types": "off",
        "react/no-children-prop": "off",
        "react/no-unescaped-entities": ["error", {"forbid": [">", "}"]}],
        "react/no-string-refs": "warn", // this actually *should* be an error, but I don't have time to fix all of these right now
        "no-control-regex": "off", // this rule is just stupid. if i put a control character in my regex, it most likely *is* intentional
        "react/no-deprecated": "off", // componentWillMount() and such have been deprecated. we do not have time to rewrite all our components right now.
        "react/jsx-no-target-blank": "off", // neat warning, but we like to mess with window.opener, so this is a no-go.
    }
};
