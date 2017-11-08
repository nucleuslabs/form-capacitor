import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, withPropsOnChange, defaultProps} from 'recompact';
import cc from 'classcat';
import {withErrors} from 'form-capacitor-schema';
import {WarningIcon} from '../bulma';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'NumberBox',
    enhancers: [
        withErrors(),
        withValue({
            valueProp: 'value',
            setValueProp: 'setValue',
            pathProp: 'path'
        }),
        withPropsOnChange('setValue', ({setValue}) => ({
            onChange(ev) {
                const value = ev.currentTarget.valueAsNumber;
                setValue(Number.isFinite(value) ? value : null);
            }
        })),
        withPropsOnChange('value', ({value}) => {
            return {value: Number.isFinite(value) ? String(value) : ''};
        }),
        omitProps(['name', 'setValue']),
    ],
    render: ({className, path, errors, ...props}) => {
        const hasErrors = errors && errors.length;
        return (
            <div className={cc(['control', className])}>
                <input id={path.join('.')} className={cc(['input',{'is-danger':hasErrors}])} type="number" min={Number.MIN_SAFE_INTEGER} max={Number.MAX_SAFE_INTEGER} {...props}/>
            </div>
        )
    }
})