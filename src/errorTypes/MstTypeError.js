export default class MstTypeError extends Error {
    constructor(originalError, message, dataType, node) {
        super();
        this.message = message;
        this.dataType = dataType;
        this.node = node;
        Object.assign(this, originalError);
        this.type = "MstTypeError";
    }
}