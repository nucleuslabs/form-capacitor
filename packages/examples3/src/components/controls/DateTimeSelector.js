import * as React from "react";
import DatePicker from 'react-datepicker';
import {consumeValue} from '../../form-capacitor';
import 'react-datepicker/src/stylesheets/datepicker-cssmodules.scss';
import './DateSelector.less';

@consumeValue()
export default class DateTimeSelector extends React.Component {
    handleChange = date => {
        this.props.setValue(date ? date.getTime().toString() : null);
    };

    render() {
        const {setValue, errors,value,dateFormat, ...props} = this.props;

        return <div><DatePicker {...props} dateFormat={dateFormat || "dd-MMM-YYYY @ h:mm aa"} selected={value!==undefined && value!==null ? new Date(parseInt(value)) : undefined} onChange={this.handleChange} showTimeSelect={true} dropdownMode="select" className="react-datepicker-date-time" isClearable={true} showMonthDropdown={true} showYearDropdown={true}/></div>
    }
}