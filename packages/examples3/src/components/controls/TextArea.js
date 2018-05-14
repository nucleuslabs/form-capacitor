import {TextArea as Component} from '../bulma';
import connect from '../../form-capacitor/connect';
import {action} from 'mobx';
import {mount} from '../../form-capacitor';

@mount({
    defaultValue: p => p.defaultValue !== undefined ? p.defaultValue : '',
    path: p => p.name,
})
@connect({
    propName: 'value',
})
export default class TextArea extends React.Component {

    @action.bound
    handleChange(ev) {
        this.value = ev.target.value;
        if(this.props.onChange) {
            this.props.onChange(ev)
        }
    }

    render() {
        const {value, name, defaultValue, ...props} = this.props;
        return <Component {...props} value={this.value} onChange={this.handleChange}/>
    }
}