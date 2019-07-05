export default class MstTypeError extends Error {
    constructor(originalError, message, dataType, node) {
        super();
        this.message = message;
        this.dataType = dataType;
        this.node = node;
        Object.keys(originalError).forEach( (prop) => this[prop] = originalError[prop]);
        this.type = "MstTypeError";
    }
}