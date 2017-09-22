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

export interface GithubFormProps {

}


const primaryLanguages = [pleaseSelect, ...languages];



const GithubForm: React.SFC<GithubFormProps> = ({onSubmit}) => {

    return (
        <form onSubmit={onSubmit}>
            <Title>Github</Title>
            <FieldRow>
                <FieldLabel normal>Username</FieldLabel>
                <SingleField>
                    <TextBox name="username" />
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
// export default GithubForm;

// https://runkit.com/esp/ajv-asynchronous-validation

export default compose(
    withValue({
        nameProp: 'name',
        valueProp: 'value',
    }),
    withSchema({
        schema: Types.requiredObject({
            $async: true,
            properties: {
                username: Types.string({
                    minLength: 4,
                    if: {
                        minLength: 4,
                    },
                    then: {
                        format: 'github'
                    }
                }),
            },
        }),
        formats: {
            github: {
                async: true,
                validate: username => fetch(`https://api.github.com/users/${encodeURIComponent(username)}`)
                    .then(res => !res.ok),
                // validate: async username => true,
            }
        }
    }),
    withHandlers({
        onSubmit: props => ev => {
            ev.preventDefault();
            console.log(stringify(props.value))
        }
    }),
)(GithubForm);

function replacer(key, value) {
    if(value instanceof Set) {
        return Array.from(value);
    }
    return value;
}

function stringify(obj) {
    return JSON.stringify(obj,replacer,2);
}


