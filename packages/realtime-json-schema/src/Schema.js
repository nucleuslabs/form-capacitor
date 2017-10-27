import dump from '../dump';
import ValidationError from './ValidationError';
import ErrorLevel from './ErrorLevel';
import ErrorCode from './ErrorCode';

export default class Schema {
    
    constructor(schema, options) {
        this.schema = schema;
        this.options = options;
    }
    
    validate(data, level) {
        return validate(this.schema, data, {...this.options, level});
    }

    /**
     * Transform into a spec-compliant schema
     */
    normalize() {
        
    }
    
     
    /**
     * Coerce data into their proper types, strip out undefined values and additional properties.
     * 
     * @param data
     */
    sanitize(data) {  // serializ"e or "sanitize"?    
       
    }
    
    format(data) {
        
    }
}

function toArray(str) {
    return Array.isArray(str) ? str : [str];
}

function validate(schema, data, options) {
    const {type, ...subschema} = schema;
    let errors;
    for(let t of toArray(type)) {
        if(!typeValidators[t]) {
            throw new Error(`type: "${t}" is not supported`);
        }
        errors = typeValidators[t](subschema, data, options);
        if(!errors) return;
    }
    return errors;
}

const typeValidators = {};

function err(code, message,level=ErrorLevel.Error) {
    return {code,message,level};
}

function obj() {
    return Object.create(null);
}

typeValidators.object = (schema, data, options) => {
    // fixme: should maybe return an array of errors, and all property errors should be nested under {code: "propertyError", details: {propName: ...
    if(typeof data !== 'object') {
        return err(ErrorCode.WrongType, `Expected object, got ${typeof data}`);
    }
    let errors;
    if(schema.properties) {
        for(let [prop,subschema] of Object.entries(schema.properties)) {
            if(data[prop] === undefined) {
                if(subschema.required) {
                    if(!errors) errors = obj();
                    errors[prop] = err(ErrorCode.Required, `Property "${prop}" is required`);
                }
            } else {
                let propErrors = validate(subschema, data[prop], options);
                if(propErrors) {
                    if(!errors) errors = obj();
                    errors[prop] = propErrors;
                }
            }
        }
    }
    const actualProperties = Object.keys(data);
    if(schema.minProperties != null) {
        if(actualProperties.length < schema.minProperties) {
            return err(ErrorCode.Required, `A minimum of ${schema.minProperties} is required, got ${actualProperties.length}`);
        }
    }
    if(schema.maxProperties != null) {
        if(actualProperties.length > schema.maxProperties) {
            return err(ErrorCode.Required, `A maximum of ${schema.maxProperties} is required, got ${actualProperties.length}`);
        }
    }
    return errors;
};

typeValidators.string = (schema, data, options) => {
    if(typeof data !== 'string') {
        return {
            code: ErrorCode.WrongType,
            level: ErrorLevel.Error,
            message: `Expected string, got ${typeof data}`,
        }
    }
};

typeValidators.integer = (schema, data, options) => {
    let numberError = typeValidators.number(schema, data, options);
    if(numberError) return numberError;
    
    if(!Number.isInteger(data)) { // alternatively, Number.isInteger, Number.isSafeInteger or maybe Math.trunc(data) === data; data|0 doesn't work on integers over 2**32
        return {
            code: ErrorCode.WrongType,
            level: ErrorLevel.Error,
            message: `Expected integer, got float ${data}`,
        }
    }
};

typeValidators.number = (schema, data, options) => {
    if(typeof data !== 'number') {
        return {
            code: ErrorCode.WrongType,
            level: ErrorLevel.Error,
            message: `Expected number, got ${typeof data}`,
        }
    }
};
