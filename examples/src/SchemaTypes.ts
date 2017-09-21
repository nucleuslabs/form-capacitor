import {JsonSchemaNumber, JsonSchemaString, JsonSchema, JsonSchemaObject} from '../../src/types/json-schema';
import {Omit} from '../../src/types/misc';

export function string(options?: Omit<JsonSchemaString,'type'>): JsonSchemaString {
    return {
        ...options,
        type: 'string',
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