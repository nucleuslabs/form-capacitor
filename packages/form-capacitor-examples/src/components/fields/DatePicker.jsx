import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {mapProps,omitProps,withProps,withPropsOnChange,defaultProps} from 'recompact';
// import {formatDate} from '../../util';
import cc from 'classcat';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'DatePicker',
    enhancers: [
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
        omitProps(['name','setValue']),
    ],
    render: ({className,path,value,...props}) => (
        <div className={cc(['control',className])}>
            <input id={path.join('.')} type="date" className="input" value={value || ''} {...props}/>
        </div>
    )
})
