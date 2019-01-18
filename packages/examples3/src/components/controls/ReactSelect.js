import Select from "react-select";
import { consumeValue } from "../../form-capacitor";
import * as React from "react";
import css from "./ReactSelect.less";

@consumeValue()
export default class ReactSelect extends React.Component {

    handleChange = (option, type) => {
        this.props.setValue(option.value);
    };

    render() {
        const { name, value, setValue, errors, options, isMulti, ...props } = this.props;

        return (
            <Select {...props} value={options.find(opt => value === opt.value)} options={options} className={errors && errors.size > 0 ? css["is-danger"] : undefined} onChange={this.handleChange}/>
        );
    }
}
