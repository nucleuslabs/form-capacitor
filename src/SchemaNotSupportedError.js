export default class SchemaNotSupportedError extends Error {
    constructor(originalError, message, path) {
        super();
        Object.assign(this, originalError);
        this.message = message;
        this.path = path;
        this.type = "SchemaNotSupportedError";
        this.originalMessage = originalError.message;
    }
}