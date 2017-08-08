import React from 'react';
import TextBox from './fields/TextBox';
import {mountPoint} from 'form-capacitor';
import NumberBox from './fields/NumberBox';
import DatePicker from './fields/DatePicker';
import {formatDate} from './util';
// import {JsonSchema} from '../../src/types/json-schema';
// import {compose, connectField, withSchema, inputChanged, withHandler} from 'form-capacitor';

export interface PersonFormProps {

}


const PersonForm: React.SFC<PersonFormProps> = props => {
    
    return (
        <div className="form-horizontal">
            <h1>Person Form</h1>
            <div className="form-group">
                <label className="col-sm-2 control-label">First Name</label>
                <div className="col-sm-10">
                    <TextBox name="firstName" />
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Last Name</label>
                <div className="col-sm-10">
                    <TextBox name="lastName"/>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Age in years</label>
                <div className="col-sm-10">
                    <NumberBox name="age"/>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Birth Date</label>
                <div className="col-sm-10">
                    <DatePicker name="birthDate" max={formatDate(new Date())}/>
                </div>
            </div>
        </div>
    )
};
// export default PersonForm;
export default mountPoint()(PersonForm);



// export default withSchema((props: PersonFormProps) => ({
//     type: 'object',
//     properties: {
//         firstName: {
//             type: 'string',
//             default: 'Mark'
//         },
//         lastName: {
//             type: 'string',
//         },
//         age: {
//             type: 'integer',
//             minimum: 0,
//         }
//     },
//     required: ['firstName', 'lastName'],
// }))(PersonForm);
