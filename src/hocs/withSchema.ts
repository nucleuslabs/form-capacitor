// import recompose from 'recompose';
import React from 'react';
import {JsonSchema} from '../types/json-schema';
import {MapFn} from '../types/misc';
import {createEagerFactory, wrapDisplayName, getDisplayName} from 'recompose';
import {defaults} from '../util';
import Ajv from 'ajv';

const ajv = new Ajv({
    allErrors: true,
});

export interface Options<TProps> {
    schema: JsonSchema|MapFn<TProps, JsonSchema>,
    valueProp: string,
}

export default function withSchema<TProps>(options: Options<TProps>) {
    const opt = defaults({
        valueProp: 'value',
    }, options);
    
    const validate = ajv.compile(opt.schema);
    
    return (WrappedComponent: React.ComponentType<TProps>) => {
        const factory = createEagerFactory(WrappedComponent);
        
        class WithSchema extends React.Component {
            static displayName = wrapDisplayName(WrappedComponent, 'withSchema');

            componentWillReceiveProps(nextProps) {
                if(nextProps[opt.valueProp] !== this.props[opt.valueProp]) {
                    // TODO: validate against the schema, then push results into store
                    const valid = validate(nextProps[opt.valueProp]);
                    if(valid) {
                        console.log(`%c${getDisplayName(WrappedComponent)}%c is %cvalid`,'font-weight:bold','','color: green');
                    } else {
                        console.log(`%c${getDisplayName(WrappedComponent)}%c is %cinvalid%c${validate.errors.map(err => `\n- ${err.dataPath ? `${err.dataPath.slice(1)} ` : ''}${err.message}`).join('')}`,'font-weight:bold','','color: red','');
                    }
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