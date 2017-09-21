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
    CheckBoxLabel, Control, SingleField, FieldLabel, FieldRow, Title1, RadioLabel, SubmitButton,
    Title2, Title, FieldBody, Field
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
                <SingleField>
                    <TextBox name="username" />
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Password</FieldLabel>
                <SingleField narrow>
                    <PasswordBox name="password"/>
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Confirm Password</FieldLabel>
                <SingleField narrow>
                    <PasswordBox name="confirmPassword"/>
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>City</FieldLabel>
                <SingleField>
                    <TextBox name="city" />
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Postal Code</FieldLabel>
                <FieldBody>
                    <Field narrow>
                        <TextBox name="postal1" size={3} />
                    </Field>
                    <Field narrow>
                        <TextBox name="postal2" size={3} />
                    </Field>
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Phone 1</FieldLabel>
                <SingleField>
                    <TextBox name="phone.0" />
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Phone 2</FieldLabel>
                <SingleField>
                    <TextBox name="phone.1" />
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Phone 3</FieldLabel>
                <SingleField>
                    <TextBox name="phone.2" />
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>BC Care Card</FieldLabel>
                <SingleField>
                    <TextBox name="careCard" />
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel/>
                <SingleField>
                    <SubmitButton>Submit</SubmitButton>
                </SingleField>
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
        schema: Types.requiredObject({
            properties: {
                username: Types.string({
                    minLength: 3,
                    
                }),
                password: Types.string({
                    minLength: 6,
                }),
                confirmPassword: Types.equalTo('1/password'),
                postal1: Types.regex(/^[a-z][0-9][a-z]$/i),
                postal2: Types.regex(/^[0-9][a-z][0-9]$/i),
                phone: Types.arrayOf(Types.string({minLength: 7}), {minItems: 2, uniqueItems: true}),
            },
            if: {
                properties: {
                    city: {
                        const: "Surrey",
                    }
                }
            },
            then: {
                properties: {
                    postal1: Types.regex(/^v[1-4]/i)
                }
            },
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


