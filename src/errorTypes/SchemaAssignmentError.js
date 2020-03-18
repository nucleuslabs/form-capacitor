export default class SchemaAssignmentError extends Error {
    constructor(originalError, message, path, value, validationErrors) {
        super();
        Object.assign(this, originalError, {
            type: 'SchemaAssignmentError',
            originalMessage: originalError.message,
            message,
            path,
            value,
            validationErrors
        });
    }
}