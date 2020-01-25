export default class SchemaAssignmentError extends Error {
    constructor(originalError, message, path, value, validationErrors) {
        super();
        const originalErrorProps = Object.keys(originalError);
        for(let i = 0; i < originalErrorProps.length; i++) {
            let prop = originalErrorProps[i];
            this[prop] = originalError[prop];
        }
        this.message = message;
        this.path = path;
        this.value = value;
        this.type = "SchemaAssignmentError";
        this.originalMessage = originalError.message;
        this.validationErrors = validationErrors;
    }
}