import * as React from "react";
import DatePicker from 'react-datepicker';
import {consumeValue} from '../../form-capacitor';
import 'react-datepicker/src/stylesheets/datepicker-cssmodules.scss';
import './DateSelector.less';

@consumeValue()
export default class DateSelector extends React.Component {
    static defaultProps = {
        dateFormat: "dd-MMM-YYYY",
    };


    handleChange = date => {
        this.props.setValue(date ? date.getTime().toString() : null);
    };

    render() {
        const {setValue,errors,value, ...props} = this.props;

        return <div><DatePicker awareOfUnicodeTokens {...props} selected={value!==undefined && value!==null ? new Date(parseInt(value)) : undefined} onChange={this.handleChange} peekNextMonth showMonthDropdown showYearDropdown dropdownMode="select" className="react-datepicker-date-only" isClearable={true}/></div>
    }
}