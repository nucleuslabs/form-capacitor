export default class PropNameSchemaError extends Error{
    /**
     * Abstract Class used by other errors that collects a propName and schema variable in the constructor
     * @param {string} propName string describing a property that does not appear in object tree
     * @param {{}} schema object tree
     */
    constructor(propName, schema) {
        const message = `Property ${propName} not Found in Schema: ${JSON.stringify(schema)}`;
        super(message);
        this.propName = propName;
        this.schema = schema;
    }
};