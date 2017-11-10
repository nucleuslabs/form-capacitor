import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {withPropsOnChange} from 'recompose';
// import {formatDate} from '../../util';
import cc from 'classcat';
import {withErrors} from 'form-capacitor-schema';
import {withPath} from '../../../../form-capacitor-state/src';
import omitProps from '../../omitProps';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'DatePicker',
    enhancers: [
        withPath(),
        withErrors(),
        withValue({
            valueProp: 'value',
            setValueProp: 'setValue',
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
