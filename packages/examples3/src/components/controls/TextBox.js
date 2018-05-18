import {InputText as Component} from '../bulma';
import {consumeValue} from '../../form-capacitor';


@consumeValue()
export default class TextArea extends React.Component {
    handleChange = ev => {
        this.props.setValue(ev.target.value);
    }

    render() {
        const {setValue, ...props} = this.props;
        return <Component {...props} onChange={this.handleChange}/>
    }
}