import createComponent from '../../createComponent';
import {mapProps, omitProps, withProps, defaultProps, withState, withHandlers, withPropsOnChange} from 'recompact';
import cc from 'classcat';
import {withErrors} from 'form-capacitor-schema';
import PropTypes from 'prop-types';
import stringLength from 'string-length';
import {withPath} from '../../../../form-capacitor-state/src';

export default createComponent({
    displayName: 'FieldErrors',
    enhancers: [
        withPath(),
        withErrors(),
    ],
    propTypes: {
        message: PropTypes.node,
    },
    render: ({errors,message}) => {
        if(!errors || !errors.length) return null;
        if(message) {
            return <div className="help is-danger content">{message}</div>
        }
        if(message || errors.length === 1) {
            return <p className="help is-danger">{formatError(errors[0])}</p>
        }
        return (
            <ul className="help is-danger">
                {errors.map(err => (
                    <li>{formatError(err)}</li>
                ))}
            </ul>
        )
    }
})

function formatError(err) {
    // console.log(err);
    switch(err.keyword) {
        case 'const':
            return "Does not match the expected value";
        case 'required':
            return "This field is required";
        case 'minItems':
            return `Please select at least ${err.params.limit} items`;
        case 'type':
            if(err.value === null) {
                return "This field is required";
            }
            break;
        case 'minLength':
            if(!err.value) {
                return `Please enter at least ${err.params.limit} characters`;
            }
            const left = err.params.limit - stringLength(err.value);
            return `Please enter ${left} more character${left === 1 ? '' : 's'}`;
    }
    return err.message.charAt(0).toLocaleUpperCase() + err.message.slice(1);
}