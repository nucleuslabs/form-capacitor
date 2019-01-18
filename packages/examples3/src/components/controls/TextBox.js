import {InputText as Component} from '../bulma';
import {consumeValue} from '../../form-capacitor';
import * as React from "react";


@consumeValue()
export default class TextBox extends React.Component {
    handleChange = ev => {
        this.props.setValue(ev.target.value);
    };

    render() {
        const {setValue,errors,name, ...props} = this.props;
        return <Component {...props} isDanger={errors && errors.size > 0} onChange={this.handleChange}/>
    }
}