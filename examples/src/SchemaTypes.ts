import {
    JsonSchemaNumber, JsonSchemaString, JsonSchema, JsonSchemaObject,
    JsonSchemaArray, JsonSchemaTuple
} from '../../src/types/json-schema';
import {Omit} from '../../src/types/misc';
import {union} from 'lodash';

export function string(options?: Omit<JsonSchemaString,'type'>): JsonSchemaString {
    return {
        ...options,
        type: 'string',
    }
}

export interface RegExpOptions {
    pattern: string,
    flags: string,
}

export function regex(pattern: RegExp|string|RegExpOptions): JsonSchemaString {
    return {
        type: 'string',
        regexp: pattern instanceof RegExp ? String(pattern) : pattern,
    }
}

export function equalTo(jsonPointer: string): JsonSchema {
    return {
        const: {$data: jsonPointer}
    }
}

export function anyOf(...schemas: JsonSchema[]): JsonSchema {
    return {
        anyOf: schemas,
    }
}

export function allOf(...schemas: JsonSchema[]): JsonSchema {
    return {
        allOf: schemas,
    }
}

export function oneOf(...schemas: JsonSchema[]): JsonSchema {
    return {
        oneOf: schemas,
    }
}

export function array(options?: Omit<JsonSchemaArray,'type'>): JsonSchemaArray {
    return {
        ...options,
        type: 'array',
    }
}

export function arrayOf(schema: JsonSchema, options?: Omit<JsonSchemaArray, 'type'|'items'>): JsonSchemaArray {
    return {
        ...options,
        type: 'array',
        items: schema,
    }
}

export function tuple(schemas: JsonSchema[], options?: Omit<JsonSchemaArray, 'type'|'items'|'minItems'|'maxItems'|'additionalItems'>): JsonSchemaArray {
    return {
        ...options,
        type: 'array',
        items: schemas,
        minItems: schemas.length,
        maxItems: schemas.length,
        // additionalItems: false,
    }
}

export function number(options?: Omit<JsonSchemaNumber,'type'>): JsonSchemaNumber {
    return {
        ...options,
        type: 'number',
    }
}

export function object(options?: Omit<JsonSchemaObject,'type'>): JsonSchemaObject {
    return {
        ...options,
        type: 'object',
    }
}

export function requiredObject(options: Omit<JsonSchemaObject,'type'>): JsonSchemaObject {
    options = {...options, type: 'object'};
    if(options.properties) {
        options.required = union(options.required, Object.keys(options.properties));
    }
    return options;
}

export function date(options?: JsonSchema): JsonSchema {
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