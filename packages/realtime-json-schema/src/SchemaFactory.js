import Schema from './Schema';

export default class SchemaFactory {
    
    
    constructor(options) {
        this.options = options;
    }
    
    create(schema) {
        return new Schema(schema, this.options);
    }
}