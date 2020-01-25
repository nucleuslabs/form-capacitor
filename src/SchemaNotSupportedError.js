export default class SchemaNotSupportedError extends Error {
    constructor(originalError, message, path) {
        super();
        const originalErrorProps = Object.keys(originalError);
        for(let i = 0; i < originalErrorProps.length; i++) {
            let prop = originalErrorProps[i];
            this[prop] = originalError[prop];
        }
        this.message = message;
        this.path = path;
        this.type = "SchemaNotSupportedError";
        this.originalMessage = originalError.message;
    }
}