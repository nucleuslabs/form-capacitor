import {Radio as Component} from '../bulma';
import connect from '../../form-capacitor/connect';
import {action} from 'mobx';

@connect({
    propName: 'menuValue',
    initialValue: p => p.defaultValue !== undefined ? p.defaultValue : null,
    // mountPoint: p => p.name,
})
export default class Radio extends React.Component {

    @action.bound
    handleChange(ev) {
        this.props.menuValue.set(ev.target.value);
        if(this.props.onChange) {
            this.props.onChange(ev)
        }
    }

    render() {
        const {value, menuValue, defaultValue, name, ...props} = this.props;
        if(value != null) {
            // have not set the `value` prop at all -- React will complain about about `undefined` and `null` and using an empty string isn't necessarily correct
            props.value = String(value);
        }
        return <Component {...props} checked={menuValue.get()==value} onChange={this.handleChange}/>
    }
}