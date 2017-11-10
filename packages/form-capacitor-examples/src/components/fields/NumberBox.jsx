import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps, omitProps, withProps, withPropsOnChange, defaultProps,withState} from 'recompact';
import cc from 'classcat';
import {withErrors} from 'form-capacitor-schema';
import {WarningIcon} from '../bulma';
import {withPath} from '../../../../form-capacitor-state/src';
import field from '../../field';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

const INTERNAL_UPDATE = '__numberbox_internal_change__';

export default createComponent({
    displayName: 'NumberBox',
    enhancers: [
        withState('value', 'setText', ''),
        field({
            valueProp: false,
            setValueProp: 'setNumber',
            onChange: ({setText, setNumber}) => ev => {
                const value = ev.currentTarget.value;
                setText(value);
                setNumber(value === '' ? null : parseFloat(value), INTERNAL_UPDATE);
            },
            valueChange(value, oldValue, context) {
                if(context !== INTERNAL_UPDATE) {
                    this.props.setText(value == null ? '' : String(value));
                }
            },
            omitProps: ['setText'],
        }),
    ],
    render: ({className, path, errors, ...props}) => {
        // console.log('rendder');
        const hasErrors = errors && errors.length;
        return (
            <div className={cc(['control', className])}>
                <input id={path.join('.')} className={cc(['input',{'is-danger':hasErrors}])} type="number" {...props}/>
            </div>
        )
    }
})