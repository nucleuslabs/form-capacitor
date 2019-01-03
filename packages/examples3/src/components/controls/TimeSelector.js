import * as React from "react";
import DatePicker from 'react-datepicker';
import {consumeValue} from '../../form-capacitor';
import 'react-datepicker/src/stylesheets/datepicker-cssmodules.scss';

@consumeValue()
export default class TimeSelector extends React.Component {
    handleChange = date => {
        this.props.setValue(date ? date.getTime().toString() : null);
    };

    render() {
        const {setValue, errors,value, ...props} = this.props;
        return <div><DatePicker {...props} selected={value!==undefined && value!==null ? new Date(parseInt(value)) : undefined} onChange={this.handleChange} showTimeSelect={true} showTimeSelectOnly={true} dropdownMode={"scroll"} dateFormat="h:mm aa" className="react-datepicker-time-only" isClearable={true} timeCaption=""/></div>
    }
}