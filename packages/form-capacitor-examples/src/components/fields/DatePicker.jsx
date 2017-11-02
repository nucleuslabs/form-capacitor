import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps,omitProps,withProps,withPropsOnChange,defaultProps} from 'recompact';
import {formatDate} from '../../util';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'DatePicker',
    enhancers: [
        withValue({
            valueProp: 'value',
            setValueProp: 'setValue',
        }),
        withPropsOnChange('setValue', ({setValue}) => ({
            onChange(ev) {
                return setValue(ev.currentTarget.value);
            }
        })),
        // withPropsOnChange('value',({value}) => ({value: value ? formatDate(value) : ''})),
        defaultProps({
            value: '', // prevents uncontrolled -> controlled warning
        }),
        omitProps(['name','setValue']),
    ],
    render: props => (
        <div className="control">
            <input type="date" className="input" {...props}/>
        </div>
    )
})
