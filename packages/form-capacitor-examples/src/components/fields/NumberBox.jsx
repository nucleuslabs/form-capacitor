import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, withPropsOnChange, defaultProps} from 'recompact';
import cc from 'classcat';
import {withErrors} from 'form-capacitor-schema';
import {WarningIcon} from '../bulma';
import {withPath} from '../../../../form-capacitor-state/src';
import field from '../../field';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'NumberBox',
    enhancers: field({
        onChange: ({setValue}) => ev => {
            const value = ev.currentTarget.valueAsNumber;
            if(Number.isFinite(value)) {
                // fixme: this can impede your typing
                // try typing "-1" and then press backspace to delete the "1"
                // you can't because it puts the numberbox into a bad state; "-" isn't a valid number
                setValue(value);
            }
            // setValue(Number.isFinite(value) ? value : null);
        },
        defaultValue: null,
    }),
    render: ({className, path, errors, value, ...props}) => {
        const hasErrors = errors && errors.length;
        value = Number.isFinite(value) ? String(value) : '';
        return (
            <div className={cc(['control', className])}>
                <input id={path.join('.')} className={cc(['input',{'is-danger':hasErrors}])} type="number" value={value} {...props}/>
            </div>
        )
    }
})