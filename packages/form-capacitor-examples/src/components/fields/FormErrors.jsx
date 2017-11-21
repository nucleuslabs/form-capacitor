import createComponent from '../../createComponent';
import {mapProps, omitProps, withProps, defaultProps, withState, withHandlers, withPropsOnChange} from 'recompose';
import cc from 'classcat';
import {withErrors} from 'form-capacitor-schema';
import PropTypes from 'prop-types';
import stringLength from 'string-length';
import {withPath} from '../../../../form-capacitor-state/src';
import {ERR} from '../../../../form-capacitor-store/src';

export default createComponent({
    displayName: 'FormErrors',
    enhancers: [
        withPath(),
        withErrors({
            includeChildren: true,
        }),
    ],
    propTypes: {
        message: PropTypes.node,
    },
    render: ({errors}) => {
        if(!errors) return null;

        // console.log("FORM ERRORS",errors);

        return <div className="help is-danger content">{formatErrors(errors, [])}</div>
    }
})

function formatErrors(obj, path) {

    const subFields = Object.entries(obj);

    // console.log('obj',obj);

    return (
        <ul>
            {obj[ERR] ? obj[ERR].map((err, idx) => {
                // console.log('errrrr',err);
                return (
                    <li key={idx}>{err.message}</li>
                )
            }) : null}
            {subFields.length ? subFields.map(([key, sf]) => {
                return (
                    <li key={key}>
                        <strong>{key}</strong>
                        {formatErrors(sf, [...path, key])}
                    </li>
                )
            }) : null}
        </ul>
    )
}