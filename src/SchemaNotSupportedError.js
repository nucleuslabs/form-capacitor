export default class SchemaNotSupportedError extends Error {
    constructor(originalError, message, path) {
        super();
        Object.keys(originalError).forEach( (prop) => this[prop] = originalError[prop]);
        this.message = message;
        this.path = path;
        this.type = "SchemaNotSupportedError";
        this.originalMessage = originalError.message;
    }
}