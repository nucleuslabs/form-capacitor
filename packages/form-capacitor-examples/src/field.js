import {compose,withHandlers,omitProps, defaultProps} from 'recompact';
import mountPoint from '../../form-capacitor-state/src/mountPoint';
import {withValue} from '../../form-capacitor-state/src';
import {withErrors} from '../../form-capacitor-schema/src';

export default function field(options) {
    options = {
        withErrors: true,
        defaultValue: null,
        onChange: undefined,
        valueProp: 'value',
        setValueProp: 'setValue',
        nameProp: 'name',
        ...options
    };
    
    let enhancers = [
        mountPoint({
            add: p => p[options.nameProp],
            mount: p => !!p[options.nameProp],
            expose: true,
        }),
        withValue({
            valueProp: options.valueProp,
            setValueProp: options.setValueProp,
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
        }), omitProps([options.nameProp,options.setValueProp]));
    }
    
    return compose(...enhancers);
}