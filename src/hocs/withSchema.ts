// import recompose from 'recompose';
import React from 'react';
import {JsonSchema} from '../types/json-schema';
import {MapFn} from '../types/misc';
import {createEagerFactory, wrapDisplayName, getDisplayName} from 'recompose';
import {defaults} from '../util';
import Ajv from 'ajv';
import installAjvKeywords from 'ajv-keywords';

const ajv = new Ajv({
    allErrors: true,
    $data: true,
    formats: {
        // TODO: how to allow custom formats via withSchema?
        BCPHN: function(phn) {
            // healthnetBC
            // http://www2.gov.bc.ca/assets/gov/health/practitioner-pro/software-development-guidelines/app_d.pdf
            // Test number: 0009123947241
            let match = phn.match(/^0*9(\d{8})(\d)$/);
            if(!match) {
                return false;
            }
            let digits = match[1];
            let checkDigit = parseInt(match[2],10);
            const weights = [2,4,8,5,10,9,7,3];
            let sum = 0;
            for(let i=0; i<weights.length; ++i) {
                let value = parseInt(digits[i],10) * weights[i];
                sum += value % 11;
            }
            let rem = sum % 11;
            return 11 - rem === checkDigit;
        },
        ONPHN: function(phn) {
            // OHIP
            // http://www.health.gov.on.ca/english/providers/pub/ohip/tech_specific/pdf/5_13.pdf
            // https://en.wikipedia.org/wiki/Luhn_algorithm
            // Test number: 9876543217
            let match = phn.match(/^([1-9]\d{8})(\d)(?:[A-Z]{2})?$/i);
            if(!match) {
                return false;
            }
            let digits = match[1];
            let checkDigit = parseInt(match[2],10);
          
            let sum = 0;
            for(let i=0; i<digits.length; ++i) {
                let digit = parseInt(digits[i],10);
                if(i%2 === 0) {
                    let double = digit * 2;
                    sum += double >= 10 ? sumOfDigits(double) : double;
                } else {
                    sum += digit;
                }
            }
            let rem = sum % 10;
            return 10 - rem === checkDigit;
        },
    }
});
installAjvKeywords(ajv);

export interface FormatObj {
    validate: string|RegExp,
    compare: (a:string,b:string) => -1|0|1,
    async: boolean,
    type?: "string"|"number"
}
export type FormatFunc = (input:string) => boolean;

export type FormatDef = string|RegExp|FormatFunc|FormatObj;

export interface FormatMap {
    [name: string]: FormatDef,
}

export interface KeywordDef {
    type?: string|string[],
    validate?: Function,
    compile?: Function,
    macro?: Function,
    inline?: Function,
    schema?: false,
    metaSchema?: JsonSchema,
    modifying?: true,
    valid?: boolean,
    $data?: true,
    async?: true,
    errors?: boolean,
}

export interface KeywordMap {
    [name: string]: KeywordDef,
}


function sumOfDigits(num) {
    return String(num).split('').map(x => parseInt(x,10)).reduce((a,b) => a + b, 0);
}

export interface Options<TProps> {
    schema: JsonSchema|MapFn<TProps, JsonSchema>,
    valueProp?: string,
}

export default function withSchema<TProps>(options: Options<TProps>, formats?: FormatMap, keywords?: KeywordMap) {
    const opt = defaults({
        valueProp: 'value',
    }, options);
    
    const validate = ajv.compile(opt.schema);
    
    return (WrappedComponent: React.ComponentType<TProps>) => {
        const factory = createEagerFactory(WrappedComponent);
        
        console.log(`${getDisplayName(WrappedComponent)} has schema:\n${JSON.stringify(opt.schema,null,2)}`);
        
        function success() {
            console.log(`%c${getDisplayName(WrappedComponent)}%c is %cvalid`,'font-weight:bold','','color: green');
        }
        
        function fail(errors) {
            // console.dir(validate);
            console.log(`%c${getDisplayName(WrappedComponent)}%c is %cinvalid%c${errors.map(err => `\n- ${err.dataPath ? `${err.dataPath.slice(1)} ` : ''}${err.message}`).join('')}`,'font-weight:bold','','color: red','');
        }
        
        function doValidate(value) {
            // TODO: validate against the schema, then push results into store
            // TODO: make this async https://github.com/epoberezkin/ajv#asynchronous-schema-compilation
            
            if(validate.$async) {
                validate(value).then(success,err => {
                    if(err instanceof Ajv.ValidationError) {
                        fail(err.errors);
                    } else {
                        throw err;
                    }
                });
            } else {
                validate(value) ? success() : fail(validate.errors);
            }
    
        }
        
        class WithSchema extends React.Component {
            static displayName = wrapDisplayName(WrappedComponent, 'withSchema');
            
            componentWillMount() {
                doValidate(this.props[opt.valueProp]);
            }
            
            componentWillReceiveProps(nextProps) {
                if(nextProps[opt.valueProp] !== this.props[opt.valueProp]) {
                    doValidate(nextProps[opt.valueProp]);
                }
            }
            
            render() {
                // console.log('withSchema.render',this.props[opt.valueProp]);
                return factory(this.props);
            }
        }
        
        return WithSchema;
    }
}