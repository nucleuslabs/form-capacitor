import React from 'react';
import TextBox from './fields/TextBox';
import {mountPoint,form} from 'form-capacitor';
import NumberBox from './fields/NumberBox';
import DatePicker from './fields/DatePicker';
import CheckBox from './fields/CheckBox';
import RadioButton from './fields/RadioButton';
import SelectBox from './fields/SelectBox';
import {formatDate} from './util';
import {
    CheckBoxLabel, Control, FieldBody, FieldLabel, FieldRow, Title1, RadioLabel, SubmitButton,
    Title2, Title
} from './bulma';

import {languages,pleaseSelect} from './options';
import {compose, withHandlers} from 'recompose';
import withSchema from '../../src/hocs/withSchema';
import withValue from '../../src/hocs/withValue';
import * as Types from './SchemaTypes';
import PasswordBox from './fields/PasswordBox';

export interface SignUpFormProps {

}


const primaryLanguages = [pleaseSelect, ...languages];



const SignUpForm: React.SFC<SignUpFormProps> = ({onSubmit}) => {

    return (
        <form onSubmit={onSubmit}>
            <Title>Sign Up</Title>
            <FieldRow>
                <FieldLabel normal>Username</FieldLabel>
                <FieldBody>
                    <TextBox name="username" />
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Password</FieldLabel>
                <FieldBody narrow>
                    <PasswordBox name="password"/>
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Confirm Password</FieldLabel>
                <FieldBody narrow>
                    <PasswordBox name="confirmPassword"/>
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Postal Code</FieldLabel>
                <FieldBody horizontal>
                    <TextBox name="postal1" size={3} />
                    <TextBox name="postal2" size={3} />
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel/>
                <FieldBody>
                    <SubmitButton>Submit</SubmitButton>
                </FieldBody>
            </FieldRow>
        </form>
    )
};
// export default SignUpForm;

export default compose(
    withValue({
        nameProp: 'name',
        valueProp: 'value',
    }),
    withSchema({
        schema: Types.object({
            required: ['username','password','confirmPassword'],
            properties: {
                username: Types.string({
                    minLength: 3,
                    
                }),
                password: Types.string({
                    minLength: 6,
                }),
                confirmPassword: Types.string({
                    const: {$data: '1/password'},
                }),
            }
        })
    }),
    withHandlers({
        onSubmit: props => ev => {
            ev.preventDefault();
            console.log(stringify(props.value))
        }
    }),
)(SignUpForm);

function replacer(key, value) {
    if(value instanceof Set) {
        return Array.from(value);
    }
    return value;
}

function stringify(obj) {
    return JSON.stringify(obj,replacer,2);
}


