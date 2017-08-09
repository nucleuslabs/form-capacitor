import React from 'react';
import TextBox from './fields/TextBox';
import {mountPoint} from 'form-capacitor';
import NumberBox from './fields/NumberBox';
import DatePicker from './fields/DatePicker';
import CheckBox from './fields/CheckBox';
import {formatDate} from './util';
// import {JsonSchema} from '../../src/types/json-schema';
// import {compose, connectField, withSchema, inputChanged, withHandler} from 'form-capacitor';
import languages from './languages';

export interface PersonFormProps {

}


const PersonForm: React.SFC<PersonFormProps> = props => {
    
    return (
        <div className="form-horizontal">
            <h1>Person Form</h1>
            <div className="form-group">
                <label className="col-sm-2 control-label">Name</label>
                <div className="col-sm-10">
                    <TextBox name="name" />
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Favourite Number</label>
                <div className="col-sm-10">
                    <NumberBox name="favNumber"/>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Birth Date</label>
                <div className="col-sm-10">
                    <DatePicker name="birthDate" max={formatDate(new Date())}/>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Primary Language</label>
                <div className="col-sm-10">
                    <select>{languages.map((lang,i) => <option key={i} value={i}>{lang}</option>}</select>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Likes</label>
                <div className="col-sm-10">
                    <ul>
                        <li className="checkbox"><label><CheckBox multiple name="likes" value="hockey"/> Hockey</label></li>
                        <li className="checkbox"><label><CheckBox multiple name="likes" value="soccer"/> Soccer</label></li>
                        <li className="checkbox"><label><CheckBox multiple name="likes" value="football"/> Football</label></li>
                    </ul>
                </div>
            </div>
            <div className="form-group">
                <div className="col-sm-2"/>
                <div className="col-sm-10">
                    <label><CheckBox name="isAboriginal"/> Is Aboriginal</label>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Gender</label>
                <div className="col-sm-10">
                    <ul>
                        <li className="checkbox"><label><input type="radio" name="gender"/> Male</label></li>
                        <li className="checkbox"><label><input type="radio" name="gender"/> Female</label></li>
                    </ul>
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
