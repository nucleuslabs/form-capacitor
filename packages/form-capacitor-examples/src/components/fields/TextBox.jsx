import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, withPropsOnChange, defaultProps} from 'recompact';
import cc from 'classcat';
import {withErrors} from 'form-capacitor-schema';
import {WarningIcon} from '../bulma';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'TextBox',
    enhancers: [
        withErrors(),
        withValue({
            valueProp: 'value',
            setValueProp: 'setValue',
            pathProp: 'path'
        }),
        withPropsOnChange('setValue', ({setValue}) => ({
            onChange(ev) {
                setValue(ev.currentTarget.value);
            }
        })),
        defaultProps({
            value: '', // prevents uncontrolled -> controlled warning
        }),
        omitProps(['name', 'setValue']),
    ],
    render: ({className, path, errors, ...props}) => {
        // console.log(props.value);
        const hasErrors = errors && errors.length;
        return (

            <div className={cc(['control', className,{'has-icons-right':hasErrors}])}>
                <input id={path.join('.')} className={cc(['input',{'is-danger':hasErrors}])} {...props}/>
                {hasErrors && <WarningIcon/>}
            </div>
        )
    }
})