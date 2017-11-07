import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, withPropsOnChange, defaultProps} from 'recompact';
// import {formatDate} from '../../util';
import cc from 'classcat';
import {withErrors} from 'form-capacitor-schema';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'DatePicker',
    enhancers: [
        withErrors(),
        withValue({
            valueProp: 'value',
            setValueProp: 'setValue',
            pathProp: 'path'
        }),
        withPropsOnChange('setValue', ({setValue}) => ({
            onChange(ev) {
                return setValue(ev.currentTarget.value || null);
            }
        })),
        // withPropsOnChange('value',({value}) => ({value: value ? formatDate(value) : ''})),
        // defaultProps({
        //     value: '', // prevents uncontrolled -> controlled warning
        // }),
        omitProps(['name', 'setValue']),
    ],
    render: ({className, path, value, errors, ...props}) => {
        const hasErrors = errors && errors.length;
        return (
            <div className={cc(['control', className])}>
                <input id={path.join('.')} type="date" className={cc(['input',{'is-danger':hasErrors}])} value={value || ''} {...props}/>
            </div>
        )
    }
})
