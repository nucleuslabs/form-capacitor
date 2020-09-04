export default class SchemaDataReplaceError extends Error {
    /**
     *
     * @param {[{prop: string, value: any, error: Error}]}schemaAssigmentErrors
     */
    constructor(schemaAssigmentErrors) {
        super();
        this.schemaAssigmentErrors = schemaAssigmentErrors;
    }
}