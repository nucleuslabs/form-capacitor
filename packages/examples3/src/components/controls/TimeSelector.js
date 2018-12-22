import DateSelector from './DateSelector';
import * as React from "react";

export default class TimeSelector extends React.Component {
    render() {
        const {dateFormat, ...props} = this.props;
        return <DateSelector {...props} showTimeSelect showTimeSelectOnly dateFormat={dateFormat || "HH:mm aa"}/>
    }
}