import {TextArea as Component} from '../bulma';
import {consumeValue} from '../../form-capacitor';

// @mount({
//     defaultValue: p => p.defaultValue !== undefined ? p.defaultValue : '',
//     path: p => p.name,
// })
// @connect({
//     propName: 'value',
// })
@consumeValue()
export default class TextArea extends React.Component {
    handleChange = ev => {
        this.props.setValue(ev.target.value);
    }
    
    render() {
        const {name, setValue, errors, ...props} = this.props;
        return <Component {...props} isDanger={errors && errors.size > 0} onChange={this.handleChange}/>
    }
}


//
// function TextArea({setValue,...props}) {
//     return <Component {...props} onChange={ev => setValue(ev.target.value)}/>
// }
//
// export default consumeValue(TextArea);