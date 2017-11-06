import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, defaultProps, withState, withHandlers, withPropsOnChange} from 'recompact';
import className from '../../className';


export default createComponent({
    displayName: 'RadioButton',
    enhancers: [
        withValue({
            valueProp: 'checked',
            setValueProp: 'setChecked',
            pathProp: 'path'
        }),
        withHandlers({
            onChange: ({setChecked, value}) => ev => {
                setChecked(value);
            }
        }),
        omitProps(['name','setChecked']),
        className(),
    ],
    render: ({id, path, value, checked, ...props}) => {
        if(!id && (typeof value === 'string' || typeof value === 'number')) {
            id = `${path.join('.')}[${value}]`;
        }
        return (
            <input id={id} type="radio" checked={checked === value} {...props}/>
        )
    }
})