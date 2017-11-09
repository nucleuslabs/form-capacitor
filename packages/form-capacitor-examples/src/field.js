import {compose, withHandlers, omitProps, defaultProps} from 'recompact';
import mountPoint from '../../form-capacitor-state/src/mountPoint';
import {withValue} from '../../form-capacitor-state/src';
import {withErrors} from '../../form-capacitor-schema/src';
import {EMPTY_ARRAY} from '../../form-capacitor-state/src/constants';

// field super-hoc. includes most common options to rig up your fields.
export default function field(options) {
    options = {
        withErrors: true,
        defaultValue: null,
        onChange: undefined, // bound to the input, invoked when you type; you should call `setValue` from here
        valueChange: undefined, // used if you need special handling for the value
        valueProp: 'value',
        setValueProp: 'setValue',
        nameProp: 'name',
        omitProps: EMPTY_ARRAY,
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
            onChange: options.valueChange,
        })
    ];
    
    if(options.valueProp && options.defaultValue !== undefined) {
        enhancers.push(defaultProps({
            [options.valueProp]: options.defaultValue,
        }));
    }

    if(options.withErrors) {
        enhancers.push(withErrors());
    }

    if(options.onChange) {
        enhancers.push(
            withHandlers({
                onChange: options.onChange,
            }),
            omitProps([options.nameProp, options.setValueProp, ...options.omitProps])
        );
    }

    return compose(...enhancers);
}