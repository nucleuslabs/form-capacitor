import {compose,withHandlers,omitProps, defaultProps} from 'recompact';
import mountPoint from '../../form-capacitor-state/src/mountPoint';
import {withValue} from '../../form-capacitor-state/src';
import {withErrors} from '../../form-capacitor-schema/src';

export default function field(options) {
    options = {
        withErrors: true,
        onChange: undefined,
        defaultValue: null,
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
        }),
        defaultProps({
            value: options.defaultValue,
        })
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