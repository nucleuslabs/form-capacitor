import React from 'react';
import TextBox from './fields/TextBox';
import {withSchema} from 'form-capacitor';
import {JsonSchema} from '../../src/types/json-schema';

export interface PersonFormProps {

}


const PersonForm: React.SFC<PersonFormProps> = props => {
    
    return (
        <div className="form-horizontal">
            <h1>Person Form</h1>
            <div className="form-group">
                <label className="col-sm-2 control-label">First Name</label>
                <div className="col-sm-10">
                    <TextBox/>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Last Name</label>
                <div className="col-sm-10">
                    <TextBox/>
                </div>
            </div>
            <div className="form-group">
                <label className="col-sm-2 control-label">Age in years</label>
                <div className="col-sm-10">
                    <TextBox/>
                </div>
            </div>
        </div>
    )
};


export default withSchema((props: PersonFormProps) => ({
    type: 'object',
    properties: {
        firstName: {
            type: 'string',
            default: 'Mark'
        },
        lastName: {
            type: 'string',
        },
        age: {
            type: 'integer',
            minimum: 0,
        }
    },
    required: ['firstName', 'lastName'],
}))(PersonForm);
