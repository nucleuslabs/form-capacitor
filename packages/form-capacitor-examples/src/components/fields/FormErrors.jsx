import createComponent from '../../createComponent';
import {mapProps, omitProps, withProps, defaultProps, withState, withHandlers, withPropsOnChange} from 'recompose';
import cc from 'classcat';
import {withErrors} from 'form-capacitor-schema';
import PropTypes from 'prop-types';
import stringLength from 'string-length';
import {withPath} from '../../../../form-capacitor-state/src';
import {ERR,SCHEMA} from '../../../../form-capacitor-store/src';
import {getValue} from 'form-capacitor-util/util';

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
        

        return <div className="help is-danger content">{formatErrors(errors, errors[SCHEMA])}</div>
    }
})

function formatErrors(obj, schema) {
    const subFields = Object.entries(obj);

    return (
        <ul>
            {obj[ERR] ? obj[ERR].map((err, idx) => {
                // console.log('errrrr',err);
                return (
                    <li key={idx}>{err.message}</li>
                )
            }) : null}
            {subFields.length ? subFields.map(([key, sf]) => {
                let title,subschema;
                if(schema) {
                    switch(schema.type) {
                        case 'object':
                            subschema = getValue(schema,['properties',key]);
                            title = getValue(subschema,['title']);
                            break;
                        case 'array':
                            subschema = getValue(schema,['items']);
                            title = `${getValue(subschema,['title'], key)} #${parseInt(key,10)+1}`;
                            break;
                        default:
                            console.debug(schema,key);
                            break;
                    }
                }
                
                return (
                    <li key={key}>
                        <strong>{title || key}</strong>
                        {formatErrors(sf, subschema)}
                    </li>
                )
            }) : null}
        </ul>
    )
}