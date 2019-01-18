import {InputText as Component} from '../bulma';
import {consumeValue} from '../../form-capacitor';
import * as React from "react";


@consumeValue()
export default class NumberBox extends React.Component {
    handleChange = ev => {
        console.log("textBox", ev.target.value);
        if(!isNaN(ev.target.value)) {
            this.props.setValue(Number(ev.target.value));
        } else if(ev.target.value === null){
            this.props.setValue(undefined);
        }
    };

    render() {
        const {setValue,errors,name,value, ...props} = this.props;
        console.log("textBox", value);
        return <Component {...props} isDanger={errors && errors.size > 0} onChange={this.handleChange} value={value === null ? undefined : value}/>
    }
}