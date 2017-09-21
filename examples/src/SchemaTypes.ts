import {JsonSchemaNumber, JsonSchemaString} from '../../src/types/json-schema';

export function string(options: JsonSchemaString): JsonSchemaString {
    return {
        ...options,
        type: 'string',
    }
}

export function number(options: JsonSchemaNumber): JsonSchemaNumber {
    return {
        ...options,
        type: 'number',
    }
}