import DateSelector from './DateSelector';
import * as React from "react";

export default class DateTimeSelector extends React.Component {
    render(){
        const {dateFormat, ...props} = this.props;
        return <DateSelector {...props} showTimeSelect dateFormat={dateFormat || "dd-MMM-YYYY HH:mm aa"}/>
    }
}