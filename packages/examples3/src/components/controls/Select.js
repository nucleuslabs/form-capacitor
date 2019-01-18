import { Select as Component } from "../bulma";
import { consumeValue } from "../../form-capacitor";
import * as React from "react";

const equalityCheck = Object.is;

@consumeValue()
export default class Select extends React.Component {
    select = React.createRef();
    state = { index: -1 };

    handleChange = ev => {
        const index = ev.target.selectedIndex;
        const value = index < 0 ? undefined : this.props.options[index].value;
        this.setState({ index });
        this.props.setValue(value);
    };

    componentDidMount() {
        this.select.current.selectedIndex = this.state.index;
    }

    componentDidUpdate() {
        this.select.current.selectedIndex = this.state.index;
    }

    // shouldComponentUpdate = scuChildren;

    static getDerivedStateFromProps(nextProps, prevState) {
        if (
            (prevState.index < 0 && nextProps.value === undefined) ||
            (prevState.index >= 0 && prevState.index < nextProps.options.length && equalityCheck(nextProps.options[prevState.index].value, nextProps.value))
        ) {
            return null;
        }
        return {
            index: nextProps.options.findIndex(opt => equalityCheck(opt.value, nextProps.value)),
        };
    }

    render() {
        let { value, name, setValue, errors, options, ...props } = this.props;

        return (
            <Component {...props} isDanger={errors && errors.size > 0} onChange={this.handleChange} ref={this.select}>
                {options.map(({ value, label, key }) => <option key={key != null ? key : value}>{label}</option>)}
            </Component>
        );
    }
}
