import {Select as Component} from '../bulma';
import {consumeValue} from '../../form-capacitor';

@consumeValue()
export default class Select extends React.Component {

    select = React.createRef();
    state = {index: -1}
    
    handleChange = ev => {
        const index = ev.target.selectedIndex;
        const value = index < 0 ? null : this.props.options[index].value;
        this.props.setValue(value);
    }

    componentDidMount() {
        this.select.current.selectedIndex = this.state.index;
    }
    
    componentDidUpdate() {
        this.select.current.selectedIndex = this.state.index;
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        // this method gets called unnecessarily when there's a change event, which kind of sucks, but not sure what to do about it.
        const index = nextProps.options.findIndex(opt => opt.value === nextProps.value);
        return index === prevState.index ? null : {index};
    }

    render() {
        let {value, name, setValue, options, ...props} = this.props;
        return (
            <Component {...props} onChange={this.handleChange} ref={this.select}>
                {options.map(({value, label, key}) => <option key={key != null ? key : value}>{label}</option>)}
            </Component>
        )
    }
}