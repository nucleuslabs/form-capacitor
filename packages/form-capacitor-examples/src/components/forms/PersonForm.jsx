import React from 'react';
import {
    CheckBoxLabel, Control, SingleField, FieldLabel, FieldRow, Title1, RadioLabel, SubmitButton, Button,
    Title2, Title, Buttons
} from '../bulma';
import TextBox from '../fields/TextBox';
import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {dirtyProvider, withDirty} from 'form-capacitor-dirty';
import {withHandlers, withState} from 'recompact';
import DirtyLabel from '../fields/DirtyLabel';
import NumberBox from '../fields/NumberBox';
import {formatDate} from '../../util';
import DatePicker from '../fields/DatePicker';
import {languages, pleaseSelect} from '../../options';
import SelectBox from '../fields/SelectBox';
import JsonCode from '../JsonCode';
import CheckBox from '../fields/CheckBox';
import {isEqual} from 'lodash';
import RadioButton from '../fields/RadioButton';
import {withSchema} from 'form-capacitor-schema';
import * as Sch from '../../SchemaTypes';
import ErrorContainer from '../fields/ErrorContainer';

const primaryLanguages = [pleaseSelect, ...languages];

export default createComponent({
    displayName: "PersonForm",
    enhancers: [
        withValue({
            defaultValue: {
                name: "Mark",
                favNumber: null,
                birthDate: "1987-12-21",
                primaryLanguageId: null,
                secondaryLanguageIds: [12, 3],
                isAboriginal: false,
                // gender: 'M'
            },
            valueProp: 'formData'
        }), // try with {name: 'person'}
        dirtyProvider({
            resetStateProp: 'resetState',
            saveStateProp: 'saveState',
        }),
        withDirty({
            path: null, // FIXME: it's weird to have to pass `null` here
            compare: isEqual,
        }),
        withSchema({
            schema: Sch.object({
                required: ['name', 'favNumber', 'primaryLanguageId', 'gender','likes'],
                properties: {
                    name: Sch.string({
                        minLength: 2,
                    }),
                    birthDate: Sch.format('date'),
                    favNumber: Sch.optional(Sch.number({
                        minimum: 1,
                        maximum: 100,
                        // exclusiveMaximum: true,
                    })),
                    likes: Sch.array({
                        items: Sch.string(),
                        minItems: 2,
                    }),
                    primaryLanguageId: Sch.number(),
                    gender: Sch.string({
                        enum: ['M', 'F'],
                    }),
                    isAboriginal: {
                        const: true
                    }
                }
            }),
            valueProp: 'formData'
        }),
        withState('saving', 'setSaving', false),
        withHandlers({
            resetState: props => ev => {
                ev.preventDefault();
                props.resetState();
            },
            saveState: props => ev => {
                // console.log('hit');
                ev.preventDefault();
                props.setSaving(true);
                const formData = props.formData;
                setTimeout(() => { // simualte ajax save
                    props.saveState(formData); // store what we actually saved instead of the current state in case the user modified the form while we were saving
                    props.setSaving(false);
                }, 750);
            },
        })
    ],
    render: ({saveState, resetState, formData, saving, isDirty}) => {
        return (
            <div>
                <form onSubmit={saveState}>
                    <Title>Person Form</Title>
                    <FieldRow>
                        <DirtyLabel normal for="name">Name</DirtyLabel>
                        <SingleField>
                            <TextBox name="name"/>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <DirtyLabel normal for="favNumber">Favourite Number</DirtyLabel>
                        <SingleField narrow>
                            <NumberBox name="favNumber"/>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <DirtyLabel normal for="birthDate">Birth Date</DirtyLabel>
                        <SingleField narrow>
                            <DatePicker name="birthDate" max={formatDate(new Date())}/>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <DirtyLabel normal for="primaryLanguageId">Primary Language</DirtyLabel>
                        <SingleField narrow>
                            <SelectBox name="primaryLanguageId" options={primaryLanguages}/>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <DirtyLabel normal for="secondaryLanguageIds">Secondary Language(s)</DirtyLabel>
                        <SingleField>
                            <SelectBox multiple name="secondaryLanguageIds" options={languages} size={6}/>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <DirtyLabel normal for="isAboriginal">Aboriginal?</DirtyLabel>
                        <SingleField>
                            <ErrorContainer for="isAboriginal">
                                <CheckBoxLabel><CheckBox name="isAboriginal"/> Aboriginal</CheckBoxLabel>
                            </ErrorContainer>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <DirtyLabel normal for="likes" htmlFor={false}>Likes</DirtyLabel>
                        <SingleField>
                            <ErrorContainer for="likes">
                                <CheckBoxLabel><CheckBox multiple name="likes" value="hockey"/> Hockey</CheckBoxLabel>
                                <CheckBoxLabel><CheckBox multiple name="likes" value="soccer"/> Soccer</CheckBoxLabel>
                                <CheckBoxLabel><CheckBox multiple name="likes" value="football"/> Football</CheckBoxLabel>
                            </ErrorContainer>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <DirtyLabel normal for="gender" htmlFor={false}>Gender</DirtyLabel>
                        <SingleField>
                            <ErrorContainer for="gender">
                                <RadioLabel><RadioButton name="gender" value="M"/> Male</RadioLabel>
                                <RadioLabel><RadioButton name="gender" value="F"/> Female</RadioLabel>
                                <RadioLabel><RadioButton name="gender" value="O"/> Other</RadioLabel>
                            </ErrorContainer>
                        </SingleField>
                    </FieldRow>

                    <FieldRow>
                        <FieldLabel/>
                        <SingleField>
                            <Buttons>
                                <SubmitButton primary disabled={saving} className={{'is-loading': saving}}>Save</SubmitButton>
                                <Button onClick={resetState} disabled={!isDirty}>Reset</Button>
                            </Buttons>
                        </SingleField>
                    </FieldRow>
                </form>
                <div style={{marginTop: '10px'}}>
                    <JsonCode>
                        {JSON.stringify(formData, null, 2)}
                    </JsonCode>
                </div>
            </div>
        )
    }
});
