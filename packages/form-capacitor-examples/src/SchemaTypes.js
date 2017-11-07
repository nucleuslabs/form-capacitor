import {union} from 'lodash';

export function string(options) {
    return {
        ...options,
        type: 'string',
    }
}

export function format(format) {
    let schema = {
        type: 'string',
    };
    if(Array.isArray(format)) {
        schema.anyOf = format.map(format => ({format}));
    } else {
        schema.format = format;
    }
    return schema;
}


export function regex(pattern) {
    return {
        type: 'string',
        regexp: pattern instanceof RegExp ? String(pattern) : pattern,
    }
}

export function equalTo(jsonPointer) {
    return {
        const: {$data: jsonPointer}
    }
}

export function anyOf(...schemas) {
    return {
        anyOf: schemas,
    }
}

export function allOf(...schemas) {
    return {
        allOf: schemas,
    }
}

export function oneOf(...schemas) {
    return {
        oneOf: schemas,
    }
}

export function array(options) {
    return {
        ...options,
        type: 'array',
    }
}

export function arrayOf(schema) {
    return {
        ...options,
        type: 'array',
        items: schema,
    }
}

export function tuple(...schemas) {
    return {
        type: 'array',
        items: schemas,
        minItems: schemas.length,
        maxItems: schemas.length,
        // additionalItems: false,
    }
}

export function number(options) {
    return {
        ...options,
        type: 'number',
    }
}

export function object(options) {
    return {
        ...options,
        type: 'object',
    }
}

export function requiredObject(options) {
    options = {...options, type: 'object'};
    if(options.properties) {
        options.required = union(options.required, Object.keys(options.properties));
    }
    return options;
}

export function date(options) {
    return {
        ...options,
        instanceof: 'Date',
    }
}

export function optional(schema) {
    return {
        anyOf: [
            {
                type: 'null',
            },
            schema
        ]
    }
}