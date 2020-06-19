export default class MstTypeError extends Error {
    constructor(originalError, message, dataType, node) {
        super();
        this.message = `${message} (type: ${dataType})`;
        this.node = node;
        Object.assign(this, originalError);
        this.type = "MstTypeError";
    }
}