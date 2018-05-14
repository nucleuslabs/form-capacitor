// this is the schema for the AST used to represent the
// "realtime-schema"

// https://astexplorer.net/#/gist/c6d87b9a6ac77b53c2a1054d0469d7af/bafd6a89c0ed3cd70a32facd930be3f3c5b522b0

// https://github.com/babel/babylon/blob/master/ast/spec.md#node-objects
// https://dsherret.github.io/ts-simple-ast/setup/ast-viewers
// https://ts-ast-viewer.com/

interface Node {
    type: string,
    loc?: SourceLocation,
}

interface SourceLocation {
    source?: string;
    start: Position;
    end: Position;
}

interface Position {
    line: number; // >= 1
    column: number; // >= 0
}

///

interface Expression extends Node {}
interface Literal extends Expression {}

interface RegExpLiteral extends Literal {
    type: "RegExpLiteral";
    pattern: string;
    flags: string;
}

interface NullLiteral extends Literal {
    type: "NullLiteral";
}

interface StringLiteral extends Literal {
    type: "StringLiteral";
    value: string;
}

interface BooleanLiteral extends Literal {
    type: "BooleanLiteral";
    value: boolean;
}

interface NumericLiteral extends Literal {
    type: "NumericLiteral";
    value: number;
}
// integers can be defined using the `multipleOf 1` rule (speaking of, there should be an `offset` as well...)

// interface IntegerLiteral extends NumericLiteral {
//     type: "IntegerLiteral";
// }
//
// interface FloatLiteral extends NumericLiteral {
//     type: "FloatLiteral";
// }

interface ArrayExpression extends Expression {
    type: "ArrayExpression";
    elements: Expression[];
}

interface ObjectMember extends Node {
    key: Expression;
}

interface ObjectProperty extends ObjectMember {
    type: "ObjectProperty";
    // shorthand: boolean; // what the heck is this?  https://github.com/babel/babylon/blob/master/ast/spec.md#objectproperty
    value: Expression;
}

interface ObjectExpression extends Expression {
    type: "ObjectExpression";
    properties: ObjectProperty[];
}

/* 
things:
 - schema (validates a thing, w/ a type + rules and has a name + desc)
 - type (like "string", or "int", or "bool", ... just the JSOn types)
 - rule (min/max/pattern,...)
 - meta
    - title
    - description
    - error message
    - default value
*/

interface JsonArray extends Array<JsonValue> {}
interface JsonObject {
    [id: string]: JsonValue;
}
type JsonValue = string|number|JsonObject|JsonArray|boolean|null;

// https://app.quicktype.io?share=xk5v9tUOCR78hoFvOsQz

interface Schema {
    name: string
    title?: string
    description?: string
    default?: JsonValue
    type: Type
}

interface RuleMap {
    [x: string]: JsonValue
}

interface Type {
    kind: 'string' | 'number' | 'object' | 'array' | 'tuple' | 'boolean' | 'null'
    rules: RuleMap
}

interface StringRules {
    minLength?: number,
    maxLength?: number,
    pattern?: string,
    /**
     * @see https://github.com/epoberezkin/ajv#formats
     */
    format?: "date" | "time" | "date-time" | "uri" | "url" | "uri-template" | "email" | "hostname" | "ipv4" | "ipv6" | "regex" | "uuid" | "json-pointer" | "relative-json-pointer" | "iri" | "iri-reference" | "uri-template" | "idn-email" | "idn-hostname" | "json-pointer" | "relative-json-pointer" | "regex" | "date" | "time"

    // https://github.com/epoberezkin/ajv-keywords#formatmaximum--formatminimum-and-formatexclusivemaximum--formatexclusiveminimum
    formatMaximum?: string,
    formatMinimum?: string,
    formatExclusiveMaximum?: boolean,
    formatExclusiveMinimum?: boolean,
}

interface NumberRules {
    multipleOf?: number,
    minimum?: number,
    maximum?: number,
    exclusiveMinimum?: boolean,
    exclusiveMaximum?: boolean,
}
