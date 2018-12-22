import {consumeValue} from '../../form-capacitor';
import DatePicker from 'react-datepicker';
import style from 'react-datepicker/dist/react-datepicker-cssmodules.css';
import * as React from "react";
// @mount({
//     defaultValue: p => p.defaultValue !== undefined ? p.defaultValue : '',
//     path: p => p.name,
// })
// @connect({
//     propName: 'value',
// })
@consumeValue()
export default class DateSelector extends React.Component {
    handleChange = date => {
        this.props.setValue(date.getTime());
    };

    render() {
        // console.log("bacon", this.props);
        const {name, setValue, value, errors, dateFormat, ...props} = this.props;
        const date = new Date(value);
        return <DatePicker className={style}
                           {...props}
                           selected={value !== undefined && value !== null ? date : undefined}
                           onChange={this.handleChange}
                           dateFormat={dateFormat || "dd-MMM-YYYY"}/>;
    }
}


//
// function TextArea({setValue,...props}) {
//     return <Component {...props} onChange={ev => setValue(ev.target.value)}/>
// }
//
// export default consumeValue(TextArea);