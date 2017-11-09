import {compose,withHandlers,omitProps} from 'recompact';
import mountPoint from '../../form-capacitor-state/src/mountPoint';
import {withValue} from '../../form-capacitor-state/src';
import {withErrors} from '../../form-capacitor-schema/src';

export default function field(options) {
    options = {
        withErrors: true,
        onChange: undefined,
        defaultValue: undefined,
        ...options
    };
    
    let enhancers = [
        mountPoint({
            add: p => p.name,
            mount: p => !!p.name,
            expose: true,
        }),
        withValue({
            valueProp: 'value',
            setValueProp: 'setValue',
            defaultValue: options.defaultValue, // fixme: should we do it this way or with defaultProps?
            // selfUpdate: false,
        }),
    ];
    
    if(options.withErrors) {
        enhancers.push(withErrors());
    }
    
    if(options.onChange) {
        enhancers.push(withHandlers({
            onChange: options.onChange,
        }), omitProps(['name','setValue']));
    }
    
    return compose(...enhancers);
}