import Select from "react-select";
import {consumeArrayValue} from "../../form-capacitor";
import * as React from "react";
import css from "./ReactSelect.less";
import * as PropTypes from "prop-types";


@consumeArrayValue()
export default class ReactMultiSelect extends React.Component {
    static propTypes = {
        value: PropTypes.arrayOf(PropTypes.string, PropTypes.number),
        options: PropTypes.arrayOf(PropTypes.shape(
            {
                value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            }
        ))
    };

    removeValue = options => {
        if(options.length > 0) {
            this.props.actions.replace(options.map(opt => opt.value));
        } else {
            this.clear();
        }
    };

    popValue = () => {
        this.props.actions.pop();
    };

    setValue = options => {
        //Shallow compare that ensures that the values is not in the array before pushing
        options.map(opt => (!this.props.value.includes(opt.value) && this.props.actions.push(opt.value)));
    };

    clear = () => {
        this.props.actions.clear();
    };

    changeActions = {
        "remove-value": this.removeValue,
        "pop-value": this.popValue,
        "set-value": this.setValue,
        "create-option": this.setValue,
        "select-option": this.setValue,
        "clear": this.clear,
    };

    handleChange = (options, type) => {
        this.changeActions[type.action.toString()](options);
    };

    render() {
        const {name, value, setValue, errors, options, actions, ...props} = this.props;
        const filtered = value.map(v => options.find(opt => v === opt.value));
        return (
            <Select isMulti {...props} value={filtered} options={options} className={errors && errors.size > 0 ? css["is-danger"] : undefined} onChange={this.handleChange}/>
        );
    }
}
