export default class SchemaAssignmentError extends Error {
    constructor(originalError, message, path, value, validationErrors) {
        super();
        Object.assign(this, originalError);
        this.message = message;
        this.path = path;
        this.value = value;
        this.type = "SchemaAssignmentError";
        this.originalMessage = originalError.message;
        this.validationErrors = validationErrors;
    }
}