import {Checkbox as Component} from '../bulma';
import connect from '../../form-capacitor/connect';
import {action} from 'mobx';
import {consumeValue, mount} from '../../form-capacitor';
import {observer} from 'mobx-react';

@consumeValue({name:'checked'})
@observer
export default class Checkbox extends React.Component {
    handleChange = ev => {
        this.props.setValue(ev.target.checked);
    }

    render() {
        const { setValue,name, errors, ...props} = this.props;
        return <Component {...props} onChange={this.handleChange}/>
    }
}