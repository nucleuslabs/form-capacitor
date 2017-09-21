export interface JsonSchema<T=any> {
    type?: string|string[],
    enum?: Array<T>,
    title?: string,
    description?: string,
    anyOf?: Array<JsonSchema>,
    oneOf?: Array<JsonSchema>,
    allOf?: Array<JsonSchema>,
    not?: JsonSchema,
    
    [x: string]: any, // custom keywords
    
    // https://github.com/epoberezkin/ajv-keywords#keywords
    
    typeof?: "undefined"|"string"|"number"|"object"|"function"|"boolean"|"symbol",
    instanceof?: "Object"|"Array"|"Function"|"Number"|"String"|"Date"|"RegExp" | "Buffer",
    range?: [number,number],
    exclusiveRange?: [number,number],
    if?: JsonSchema,
    then?: JsonSchema,
    else?: JsonSchema,
    /**
     * @see https://github.com/epoberezkin/ajv-keywords#switch
     */
    switch?: Array<IfThenClause>,
    patternRequired?: string[],
    prohibited?: string[],
    deepProperties?: {[x:string]: JsonSchema},
    deepRequired?: string[],
    uniqueItemProperties?: string[],
    regexp?: string|RegExpOptions,
}

export interface RegExpOptions {
    pattern: string,
    flags: string,
}

export interface IfThenClause {
    if?: JsonSchema,
    then: JsonSchema|boolean,
    continue?: boolean,
}

export interface JsonSchemaString extends JsonSchema<string> {
    type: "string",
    minLength?: number,
    maxLength?: number,
    pattern?: string,
    /**
     * @see https://github.com/epoberezkin/ajv#formats
     */
    format?: "date" | "time" | "date-time" | "uri" | "url" | "uri-template" | "email" | "hostname" | "ipv4" | "ipv6" | "regex" | "uuid" | "json-pointer" | "relative-json-pointer",

    // https://github.com/epoberezkin/ajv-keywords#formatmaximum--formatminimum-and-formatexclusivemaximum--formatexclusiveminimum
    formatMaximum?: string,
    formatMinimum?: string,
    formatExclusiveMaximum?: boolean,
    formatExclusiveMinimum?: boolean,
}

export interface JsonSchemaTuple extends Array<JsonSchema> {
}
export interface JsonSchemaArray extends JsonSchema<any[]> {
    type: "array",
    items?: JsonSchema | JsonSchemaTuple,
    additionalItems?: boolean,
    minItems?: number,
    maxItems?: number,
    uniqueItems?: boolean,
}

export interface JsonSchemaBoolean extends JsonSchema<boolean> {
    type: "boolean",
}

export interface JsonSchemaNumber extends JsonSchema<number> {
    type: "integer" | "number",
    multipleOf?: number,
    minimum?: number,
    maximum?: number,
    exclusiveMinimum?: boolean,
    exclusiveMaximum?: boolean,
}

export interface JsonSchemaObject extends JsonSchema<object>, JsonSchemaDependency {
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

export interface JsonSchemaNull extends JsonSchema<null> {
    type: "null"
}
