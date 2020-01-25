export default class MstTypeError extends Error {
    constructor(originalError, message, dataType, node) {
        super();
        this.message = message;
        this.dataType = dataType;
        this.node = node;
        const originalErrorProps = Object.keys(originalError);
        for(let i = 0; i < originalErrorProps.length; i++) {
            let prop = originalErrorProps[i];
            this[prop] = originalError[prop];
        }
        this.type = "MstTypeError";
    }
}