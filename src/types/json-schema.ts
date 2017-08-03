interface JsonSchemaType<T> {
    type: string,
    enum?: Array<T>,
    title?: string,
    description?: string,
    default?: T,
}

interface JsonSchemaString extends JsonSchemaType<string> {
    type: "string",
    minLength?: number,
    maxLength?: number,
    pattern?: string,
    format?: "date-time" | "email" | "hostname" | "ipv4" | "ipv6" | "uri",
}

interface JsonSchemaTuple extends Array<JsonSchema> {
}

interface JsonSchemaArray extends JsonSchemaType<any[]> {
    type: "array",
    items?: JsonSchema | JsonSchemaTuple,
    additionalItems?: boolean,
    minItems?: number,
    maxItems?: number,
    uniqueItems?: boolean,
}

interface JsonSchemaBoolean extends JsonSchemaType<boolean> {
    type: "boolean",
}

interface JsonSchemaNumber extends JsonSchemaType<number> {
    type: "integer" | "number",
    multipleOf?: number,
    minimum?: number,
    maximum?: number,
    exclusiveMinimum?: boolean,
    exclusiveMaximum?: boolean,
}

interface JsonSchemaObject extends JsonSchemaType<object>, JsonSchemaDependency {
    type: "object",
}

interface JsonSchemaDependency {
    properties?: { [key: string]: JsonSchema },
    additionalProperties?: boolean,
    required?: Array<string>,
    minProperties?: number,
    maxProperties?: number,
    dependencies?: { [key: string]: Array<string> } | JsonSchemaDependency,
    patternProperties?: { [key: string]: JsonSchema },
}

interface JsonSchemaNull extends JsonSchemaType<null> {
    type: "null"
}

export type JsonSchema =
    JsonSchemaString
    | JsonSchemaArray
    | JsonSchemaBoolean
    | JsonSchemaNumber
    | JsonSchemaObject
    | JsonSchemaNull;