import { Radio } from "../bulma";
import { consumeValue } from "../../form-capacitor";
import * as React from "react";
import shortid from 'shortid';
import css from './RadioMenu.less';

const equalityCheck = Object.is;

@consumeValue()
export default class RadioMenu extends React.Component {
    static defaultProps = {
        orientation: "vertical",
    };
    shortId = shortid();

    handleChange = ev => {
        const value = ev.target.value;
        if(isNaN(value)){
            this.props.setValue(value);
        } else {
            this.props.setValue(Number(value));
        }
    };

    render() {
        let { name, setValue, errors, options, orientation, ...props } = this.props;
        return (
            <div className={errors && errors.size > 0 ? css['is-danger'] : css['is-normal']}>
                <ul className={`${css["radio-ul"]} ${css[orientation]}`}>
                    {options.map(({ value, label, key }) => <li key={key != null ? key : value} ><Radio name={this.shortId} value={value} onChange={this.handleChange} checked={equalityCheck(value, props.value)} >{label}</Radio></li>)}
                </ul>
            </div>
        );
    }
}
