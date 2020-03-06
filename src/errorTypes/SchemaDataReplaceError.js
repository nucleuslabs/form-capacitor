export default class SchemaDataReplaceError extends Error {
    constructor(Errors, message) {
        super();
        this.message = message;
        this.type = "SchemaDataReplaceError";
        this.errors = Errors;

        this.validationErrors = Errors;
    }
}