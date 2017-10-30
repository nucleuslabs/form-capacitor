import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-store';
import {mapProps} from 'recompact';
// import dump from 'form-capacitor-util/dump';

// console.log(withValue);

export default createComponent({
    displayName: 'TextBox',
    enhancers: [
        withValue({
            valueProp: 'value',
            nameProp: 'name',
            setValueProp: 'setValue',
        }),
        mapProps(({setValue,...props}) => ({
            ...props,
            onChange(ev) {
                setValue(ev.currentTarget.value);
            }
        }))
    ],
    render: ({path, name, ...attrs}) => (
        <div className="control">
            <input className="input" {...attrs}/>
        </div>
    )
})