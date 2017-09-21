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
    Title2, Title
} from './bulma';
import field from '../../src/hocs/field';


// import {JsonSchema} from '../../src/types/json-schema';
// import {compose, connectField, withSchema, inputChanged, withHandler} from 'form-capacitor';
import {languages,pleaseSelect} from './options';
import {compose, withHandlers} from 'recompose';
import withSchema from '../../src/hocs/withSchema';
import withValue from '../../src/hocs/withValue';
import * as Types from './SchemaTypes';

export interface PersonFormProps {

}


const primaryLanguages = [pleaseSelect, ...languages];



const PersonForm: React.SFC<PersonFormProps> = ({onSubmit}) => {
    
    return (
        <form onSubmit={onSubmit}>
            <Title>Person Form</Title>
            <FieldRow>
                <FieldLabel normal>Name</FieldLabel>
                <SingleField>
                    <TextBox name="name" />
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Favourite Number</FieldLabel>
                <SingleField narrow>
                    <NumberBox name="favNumber"/>
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Birth Date</FieldLabel>
                <SingleField narrow>
                    <DatePicker name="birthDate" max={formatDate(new Date())}/>
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Primary Language</FieldLabel>
                <SingleField>
                    <SelectBox name="primaryLanguageId" options={primaryLanguages}/>
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Secondary Languages</FieldLabel>
                <SingleField>
                    <SelectBox multiple name="secondaryLanguageIds" options={languages}/>
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel>Likes</FieldLabel>
                <SingleField>
                    <Control>
                        <CheckBoxLabel><CheckBox multiple name="likes" value="hockey"/> Hockey</CheckBoxLabel>
                        <CheckBoxLabel><CheckBox multiple name="likes" value="soccer"/> Soccer</CheckBoxLabel>
                        <CheckBoxLabel><CheckBox multiple name="likes" value="football"/> Football</CheckBoxLabel>
                    </Control>
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel>Aboriginal?</FieldLabel>
                <SingleField>
                    <Control>
                        <CheckBoxLabel><CheckBox name="isAboriginal"/> Aboriginal</CheckBoxLabel>
                    </Control>
                </SingleField>
            </FieldRow>
            <FieldRow>
                <FieldLabel>Gender</FieldLabel>
                <SingleField>
                    <Control>
                        <RadioLabel><RadioButton name="gender" value="M"/> Male</RadioLabel>
                        <RadioLabel><RadioButton name="gender" value="F"/> Female</RadioLabel>
                        <RadioLabel><RadioButton name="gender" value="O"/> Other</RadioLabel>
                    </Control>
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
// export default PersonForm;

export default compose(
    withValue({
        nameProp: 'name',
        valueProp: 'value',
    }),
    withSchema({
        schema: Types.object({
            required: ['name','favNumber','primaryLanguageId','gender'],
            properties: {
                name: Types.string({
                    minLength: 2,
                }),
                birthDate: Types.date(),
                favNumber: Types.optional(Types.number()),
                primaryLanguageId: Types.number(),
                gender: Types.string({
                    enum: ['M','F'],
                })
            }
        })
    }),
    withHandlers({
        onSubmit: props => ev => {
            ev.preventDefault();
            console.log(stringify(props.value))
        }
    }),
)(PersonForm);
    
function replacer(key, value) {
    if(value instanceof Set) {
        return Array.from(value);
    }
    return value;
}

function stringify(obj) {
    return JSON.stringify(obj,replacer,2);
}




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
