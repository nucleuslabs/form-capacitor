import {Checkbox as Component} from '../bulma';
import connect from '../../form-capacitor/connect';
import {action} from 'mobx';
import {consumeValue, mount} from '../../form-capacitor';


@consumeValue({name:'checked'})
export default class Checkbox extends React.Component {
    handleChange = ev => {
        // console.log('checkkked',ev.target.checked);
        this.props.setValue(ev.target.checked);
    }

    render() {
        const { setValue,name, errors, ...props} = this.props;
        // console.log(props.checked);
        return <Component {...props} onChange={this.handleChange}/>
    }
}