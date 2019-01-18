import {Checkbox as Component} from '../bulma';
import {consumeValue} from '../../form-capacitor';
import * as React from "react";

@consumeValue({name:'checked'})
export default class Checkbox extends React.Component {
    handleChange = ev => {
        this.props.setValue(ev.target.checked);
    };

    render() {
        const { setValue,name, errors, ...props} = this.props;
        return <Component {...props} onChange={this.handleChange}/>
    }
}