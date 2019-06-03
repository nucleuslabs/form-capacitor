export default class SchemaDataReplaceError extends Error {
    constructor(Errors, message, pathValueMap, validationErrors) {
        super();
        Object.keys(originalError).forEach( (prop) => this[prop] = originalError[prop]);
        this.message = message;
        this.pathValueMap = pathValueMap;
        this.type = "SchemaDataReplaceError";
        this.errors = Errors;
        this.validationErrors = validationErrors;
    }
}