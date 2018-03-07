import {InputText} from '../bulma';
import connect from '../../form-capacitor/connect';
import {action} from 'mobx';

@connect({
    propName: 'value',
    initialValue: '',
    mountPoint: p => p.name,
})
export default class TextBox extends React.Component {

    handleChange = action(ev => {
        this.props.value.set(ev.currentTarget.value);
        if(this.props.onChange) {
            this.props.onChange(ev)
        }
    })
    
    render() {
        const {value, name, ...props} = this.props;
        return <InputText {...props} value={value.get()} onChange={this.handleChange}/>
    }
}