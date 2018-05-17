import {TextArea as Component} from '../bulma';
import connect from '../../form-capacitor/connect';
import {action} from 'mobx';
import {consumeValue, mount} from '../../form-capacitor';

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
        const {name, setValue, ...props} = this.props;
        return <Component {...props} onChange={this.handleChange}/>
    }
}


//
// function TextArea({setValue,...props}) {
//     return <Component {...props} onChange={ev => setValue(ev.target.value)}/>
// }
//
// export default consumeValue(TextArea);