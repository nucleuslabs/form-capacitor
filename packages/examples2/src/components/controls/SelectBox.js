import {InputText, Select} from '../bulma';
import {connect,mount} from '../../form-capacitor';
import {action,toJS} from 'mobx';

@mount({
    defaultValue: '',
    path: p => p.name,
})
@connect({
    propName: 'value',
    // observe(change) {
    //     console.log('selectbox change',change);
    // }
})
export default class SelectBox extends React.Component {

    @action.bound
    handleChange(ev) {
        this.value = ev.target.value;
        if(this.props.onChange) {
            this.props.onChange(ev)
        }
    }

    render() {
        let {value, name, defaultValue, ...props} = this.props;
        value = toJS(this.value);
        // console.log('select',value);
        if(value != null) {
            // have not set the `value` prop at all -- React will complain about about `undefined` and `null` and using an empty string isn't necessarily correct
            props.value = String(value);
        }
        return <Select {...props} onChange={this.handleChange}/>
    }
}