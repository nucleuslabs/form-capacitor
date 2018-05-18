import {InputText, Select as Component} from '../bulma';
import {connect, consumeValue, mount} from '../../form-capacitor';
import {action,toJS} from 'mobx';
import * as options from '../../options';

@consumeValue()
export default class Select extends React.Component {

    el = React.createRef();
    
    handleChange = ev => {
        const index = ev.target.selectedIndex;
        const value = index < 0 ? null : this.props.options[index].value;
        
        this.props.setValue(value);
    }

    render() {
        let {value, name, setValue, options, ...props} = this.props;
        value = toJS(this.value);
        // console.log('select',value);
        if(value != null) {
            // have not set the `value` prop at all -- React will complain about about `undefined` and `null` and using an empty string isn't necessarily correct
            props.value = String(value);
        }
        return (
            <Component {...props} onChange={this.handleChange} ref={this.el}>
                {options.map(({value, label}) => <option key={value}>{label}</option>)}
            </Component>
        )
    }
}