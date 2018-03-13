import {InputText, Select} from '../bulma';
import connect from '../../form-capacitor/connect';
import {action,toJS} from 'mobx';

@connect({
    propName: 'value',
    defaultValue: '',
    mountPoint: p => p.name,
})
export default class SelectBox extends React.Component {

    @action.bound
    handleChange(ev) {
        this.props.value.set(ev.target.value);
        if(this.props.onChange) {
            this.props.onChange(ev)
        }
    }

    render() {
        let {value, name, defaultValue, ...props} = this.props;
        value = toJS(value);
        if(value != null) {
            // have not set the `value` prop at all -- React will complain about about `undefined` and `null` and using an empty string isn't necessarily correct
            props.value = String(value);
        }
        return <Select {...props} onChange={this.handleChange}/>
    }
}