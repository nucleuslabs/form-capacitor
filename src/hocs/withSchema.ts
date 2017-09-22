// import recompose from 'recompose';
import React from 'react';
import {JsonSchema} from '../types/json-schema';
import {MapFn} from '../types/misc';
import {createEagerFactory, wrapDisplayName, getDisplayName} from 'recompose';
import {defaults} from '../util';
import Ajv, {KeywordDefinition} from 'ajv';
import installAjvKeywords from 'ajv-keywords';


export interface FormatOptions {
    validate: FormatValidator,
    compare?: (a:string,b:string) => -1|0|1,
    async?: boolean,
    type?: "string"|"number"
}
export type FormatFunction = (input:string) => boolean|Promise<boolean>; // https://github.com/epoberezkin/ajv/issues/570

export type FormatValidator = string|RegExp|FormatFunction;

export type FormatDefinition = FormatValidator|FormatOptions;


export interface FormatMap {
    [name: string]: FormatDefinition,
}

export interface KeywordMap {
    [name: string]: KeywordDefinition,
}


export interface Options<TProps> {
    schema: JsonSchema|MapFn<TProps, JsonSchema>,
    valueProp?: string,
    formats?: FormatMap,
    keywords?: KeywordMap,
}

export default function withSchema<TProps>(options: Options<TProps>): React.ComponentClass<TProps> {
    const opt = defaults({
        valueProp: 'value',
    }, options);

    const ajv = new Ajv({
        allErrors: true,
        $data: true,
        ownProperties: true,
    });
    installAjvKeywords(ajv);
    
    if(opt.formats) {
        for (let k of Object.keys(opt.formats)) {
            ajv.addFormat(k, opt.formats[k]);
        }
    }
    if(opt.keywords) {
        for (let k of Object.keys(opt.keywords)) {
            ajv.addKeyword(k, opt.keywords[k]);
        }
    }
    
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