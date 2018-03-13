import {Checkbox as Component} from '../bulma';
import connect from '../../form-capacitor/connect';
import {action} from 'mobx';

@connect({
    propName: 'checked',
    defaultValue: p => !!p.defaultValue,
    mountPoint: p => p.name,
})
export default class Checkbox extends React.Component {

    @action.bound
    handleChange(ev) {
        this.props.checked.set(ev.target.checked);
        if(this.props.onChange) {
            this.props.onChange(ev)
        }
    }

    render() {
        const {checked, value, defaultValue, name, ...props} = this.props;
        return <Component {...props} checked={checked.get()} onChange={this.handleChange}/>
    }
}