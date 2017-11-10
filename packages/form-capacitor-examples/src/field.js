import {compose, withHandlers, defaultProps, withState} from 'recompose';
import mountPoint from '../../form-capacitor-state/src/mountPoint';
import {withValue} from '../../form-capacitor-state/src';
import {withErrors} from '../../form-capacitor-schema/src';
import {EMPTY_ARRAY} from '../../form-capacitor-state/src/constants';
import omitProps from './omitProps';

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
        withState: undefined,
        ...options
    };

    let enhancers = [
        mountPoint({
            add: p => p[options.nameProp],
            mount: p => !!p[options.nameProp],
            expose: true,
        }),
    ];
    
    if(options.withState) {
        const states = Array.isArray(options.withState) ? options.withState : [options.withState];
        enhancers.push(...states.map(opt => withState(opt.valueProp, opt.setProp, opt.initial)));
    }
    
    enhancers.push(withValue({
        valueProp: options.valueProp,
        setValueProp: options.setValueProp,
        onChange: options.valueChange,
    }));
    
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