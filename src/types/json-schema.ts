export interface JsonSchemaType<T> {
    type: string,
    enum?: Array<T>,
    title?: string,
    description?: string,
    default?: T,
}

export interface JsonSchemaString extends JsonSchemaType<string> {
    type: "string",
    minLength?: number,
    maxLength?: number,
    pattern?: string,
    format?: "date-time" | "email" | "hostname" | "ipv4" | "ipv6" | "uri",
}

export interface JsonSchemaTuple extends Array<JsonSchema> {
}

export interface JsonSchemaArray extends JsonSchemaType<any[]> {
    type: "array",
    items?: JsonSchema | JsonSchemaTuple,
    additionalItems?: boolean,
    minItems?: number,
    maxItems?: number,
    uniqueItems?: boolean,
}

export interface JsonSchemaBoolean extends JsonSchemaType<boolean> {
    type: "boolean",
}

export interface JsonSchemaNumber extends JsonSchemaType<number> {
    type: "integer" | "number",
    multipleOf?: number,
    minimum?: number,
    maximum?: number,
    exclusiveMinimum?: boolean,
    exclusiveMaximum?: boolean,
}

export interface JsonSchemaObject extends JsonSchemaType<object>, JsonSchemaDependency {
    type: "object",
}

export interface JsonSchemaDependency {
    properties?: { [key: string]: JsonSchema },
    additionalProperties?: boolean,
    required?: Array<string>,
    minProperties?: number,
    maxProperties?: number,
    dependencies?: { [key: string]: Array<string> } | JsonSchemaDependency,
    patternProperties?: { [key: string]: JsonSchema },
}

export interface JsonSchemaNull extends JsonSchemaType<null> {
    type: "null"
}

export type JsonSchema =
    JsonSchemaString
    | JsonSchemaArray
    | JsonSchemaBoolean
    | JsonSchemaNumber
    | JsonSchemaObject
    | JsonSchemaNull;