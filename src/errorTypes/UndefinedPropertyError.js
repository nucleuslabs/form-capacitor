export default class UndefinedPropertyError extends Error {
    constructor(property, schema) {
        super();
        this.message = `The property ${property} could not be found in the schema ${JSON.stringify(schema)}`;
        this.type = "UndefinedPropertyError";
    }
}