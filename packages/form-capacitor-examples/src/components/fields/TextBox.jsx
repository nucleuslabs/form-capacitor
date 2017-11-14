import createComponent from '../../createComponent';
import {withValue, mountPoint, withPath} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, withPropsOnChange, defaultProps,pure} from 'recompose';
import cc from 'classcat';
import {withErrors} from 'form-capacitor-schema';
import {WarningIcon} from '../bulma';
import field from '../../field';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'TextBox',
    enhancers: [
        // mountPoint({add: p => p.name, expose: true}),
        field({
            onChange: ({setValue}) => ev => {
                setValue(ev.currentTarget.value);
            },
            defaultValue: ''  // prevents uncontrolled -> controlled warning
        }),
        // pure,
    ],
    render: ({className, path, errors, ...props}) => {
        // console.log('render textbox',props.value);
        const hasErrors = errors && errors.length;
        return (

            <div className={cc(['control', className,{'has-icons-right':hasErrors}])}>
                <input id={path.join('.')} className={cc(['input',{'is-danger':hasErrors}])} {...props}/>
                {hasErrors && <WarningIcon/>}
            </div>
        )
    }
})