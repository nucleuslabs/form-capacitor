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


// import {JsonSchema} from '../../src/types/json-schema';
// import {compose, connectField, withSchema, inputChanged, withHandler} from 'form-capacitor';
import languages from './languages';

export interface PersonFormProps {

}

const pleaseSelect = {value: null, label: "– Please Select –"};
const primaryLanguages = [pleaseSelect, ...languages];



const PersonForm: React.SFC<PersonFormProps> = ({onSubmit}) => {
    
    return (
        <form onSubmit={onSubmit}>
            <Title>Person Form</Title>
            <FieldRow>
                <FieldLabel normal>Name</FieldLabel>
                <FieldBody>
                    <TextBox name="name" />
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Favourite Number</FieldLabel>
                <FieldBody narrow>
                    <NumberBox name="favNumber"/>
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Birth Date</FieldLabel>
                <FieldBody narrow>
                    <DatePicker name="birthDate" max={formatDate(new Date())}/>
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Primary Language</FieldLabel>
                <FieldBody>
                    <SelectBox name="primaryLanguageId" options={primaryLanguages}/>
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel normal>Secondary Languages</FieldLabel>
                <FieldBody>
                    <SelectBox multiple name="secondaryLanguageIds" options={languages}/>
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel>Likes</FieldLabel>
                <FieldBody>
                    <Control>
                        <CheckBoxLabel><CheckBox multiple name="likes" value="hockey"/> Hockey</CheckBoxLabel>
                        <CheckBoxLabel><CheckBox multiple name="likes" value="soccer"/> Soccer</CheckBoxLabel>
                        <CheckBoxLabel><CheckBox multiple name="likes" value="football"/> Football</CheckBoxLabel>
                    </Control>
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel>Aboriginal?</FieldLabel>
                <FieldBody>
                    <Control>
                        <CheckBoxLabel><CheckBox name="isAboriginal"/> Aboriginal</CheckBoxLabel>
                    </Control>
                </FieldBody>
            </FieldRow>
            <FieldRow>
                <FieldLabel>Gender</FieldLabel>
                <FieldBody>
                    <Control>
                        <RadioLabel><RadioButton name="gender" group="sex" value="M"/> Male</RadioLabel>
                        <RadioLabel><RadioButton name="gender" group="sex" value="F"/> Female</RadioLabel>
                        <RadioLabel><RadioButton name="gender" group="sex" value="O"/> Other</RadioLabel>
                    </Control>
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
// export default PersonForm;
export default form({
    eventHandler({data}) {
        
        console.log('submit',data);
    }
})(PersonForm);



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
