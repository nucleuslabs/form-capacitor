import {Checkbox as Component} from '../bulma';
import connect from '../../form-capacitor/connect';
import {action} from 'mobx';
import {consumeValue, mount} from '../../form-capacitor';


@consumeValue({name:'checked'})
export default class TextArea extends React.Component {
    handleChange = ev => {
        this.props.setValue(ev.target.checked);
    }

    render() {
        const { setValue, ...props} = this.props;
        return <Component {...props} onChange={this.handleChange}/>
    }
}