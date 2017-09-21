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
});
installAjvKeywords(ajv);

export interface Options<TProps> {
    schema: JsonSchema|MapFn<TProps, JsonSchema>,
    valueProp?: string,
}

export default function withSchema<TProps>(options: Options<TProps>) {
    const opt = defaults({
        valueProp: 'value',
    }, options);
    
    const validate = ajv.compile(opt.schema);
    
    return (WrappedComponent: React.ComponentType<TProps>) => {
        const factory = createEagerFactory(WrappedComponent);
        
        console.log(`${getDisplayName(WrappedComponent)} has schema:\n${JSON.stringify(opt.schema,null,2)}`);

        function doValidate(value) {
            // TODO: validate against the schema, then push results into store
            // TODO: make this async https://github.com/epoberezkin/ajv#asynchronous-schema-compilation
            const valid = validate(value);
            if(valid) {
                console.log(`%c${getDisplayName(WrappedComponent)}%c is %cvalid`,'font-weight:bold','','color: green');
            } else {
                // console.dir(validate);
                console.log(`%c${getDisplayName(WrappedComponent)}%c is %cinvalid%c${validate.errors.map(err => `\n- ${err.dataPath ? `${err.dataPath.slice(1)} ` : ''}${err.message}`).join('')}`,'font-weight:bold','','color: red','');
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