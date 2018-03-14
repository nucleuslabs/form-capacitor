import {Checkbox as Component} from '../bulma';
import connect from '../../form-capacitor/connect';
import {action} from 'mobx';
import {mount} from '../../form-capacitor';

@mount({
    defaultValue: false,
    path: p => p.name,
})
@connect({
    propName: 'checked',
})
export default class Checkbox extends React.Component {

    @action.bound
    handleChange(ev) {
        this.checked = ev.target.checked;
        if(this.props.onChange) {
            this.props.onChange(ev)
        }
    }

    render() {
        const {checked, value, defaultValue, name, ...props} = this.props;
        return <Component {...props} checked={this.checked} onChange={this.handleChange}/>
    }
}