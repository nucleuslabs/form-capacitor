import React from 'react';
import {
    CheckBoxLabel, Control, SingleField, FieldLabel, FieldRow, Title1, RadioLabel, SubmitButton, Button,
    Title2, Title, Buttons, FieldBody
} from '../bulma';
import TextBox from '../fields/TextBox';
import createComponent from '../../createComponent';
import {mountPoint, withValue} from 'form-capacitor-state';
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
import FieldErrors from '../fields/FieldErrors';
import Mount from '../Mount';
import shortid from 'shortid';
import onMount from '../../onMount';
const primaryLanguages = [pleaseSelect, ...languages];

export default createComponent({
    displayName: "PersonForm",
    enhancers: [
        mountPoint({add: p => p.name || shortid(), expose: true}),
        withValue({
            // defaultValue: {
            //     // name: "Mark",
            //     favNumber: null,
            //     birthDate: "1987-12-21",
            //     primaryLanguageId: 11,
            //     secondaryLanguageIds: [12, 3],
            //     isAboriginal: false,
            //     // gender: 'M'
            // },
            setValueProp: 'setValue',
            valueProp: 'formData'
        }), // try with {name: 'person'}

        
        dirtyProvider({
            resetStateProp: 'resetState',
            saveStateProp: 'saveState',
        }),

        onMount(({setValue,saveState}) => {
            // console.log('AAA');
            setTimeout(() => {
                setValue({
                    name: "Mark",
                    favNumber: null,
                    birthDate: "1987-12-21",
                    primaryLanguageId: 11,
                    secondaryLanguageIds: [12, 3],
                    isAboriginal: false,
                    // gender: 'M'
                });
                saveState(); // <-- clear the dirtyness because we've just loaded fresh data from the db
                
                // TODO: some kind of form loading state...
            }, 1000); // <-- loading form data from database
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
                        <Mount path="name">
                            <DirtyLabel>Name</DirtyLabel>
                            <SingleField>
                                <TextBox/>
                                <FieldErrors/>
                            </SingleField>
                        </Mount>
                    </FieldRow>
                    <FieldRow>
                        <Mount path="favNumber">
                            <DirtyLabel>Favourite Number</DirtyLabel>
                            <SingleField narrow>
                                <NumberBox/>
                                <FieldErrors message="Must be between 1 and 100"/>
                            </SingleField>
                        </Mount>
                    </FieldRow>
                    <FieldRow>
                        <Mount path="birthDate">
                            <DirtyLabel>Birth Date</DirtyLabel>
                            <SingleField narrow>
                                <DatePicker max={formatDate(new Date())}/>
                                <FieldErrors/>
                            </SingleField>
                        </Mount>
                    </FieldRow>
                    <FieldRow>
                        <Mount path="primaryLanguageId">
                            <DirtyLabel>Primary Language</DirtyLabel>
                            <SingleField narrow>
                                <SelectBox options={primaryLanguages}/>
                                <FieldErrors/>
                            </SingleField>
                        </Mount>
                    </FieldRow>
                    <FieldRow>
                        <Mount path="secondaryLanguageIds">
                            <DirtyLabel>Secondary Language(s)</DirtyLabel>
                            <SingleField>
                                <SelectBox multiple options={languages} size={6}/>
                                <FieldErrors/>
                            </SingleField>
                        </Mount>
                    </FieldRow>
                    <FieldRow>
                        <Mount path="isAboriginal">
                            <DirtyLabel>Aboriginal?</DirtyLabel>
                            <SingleField>
                                <ErrorContainer>
                                    <CheckBoxLabel><CheckBox/> Aboriginal</CheckBoxLabel>
                                </ErrorContainer>
                                <FieldErrors/>
                            </SingleField>
                        </Mount>
                    </FieldRow>
                    <FieldRow>
                        <Mount path="likes">
                            <DirtyLabel htmlFor={false}>Likes</DirtyLabel>
                            <SingleField>
                                <ErrorContainer>
                                    <CheckBoxLabel><CheckBox multiple value="hockey"/> Hockey</CheckBoxLabel>
                                    <CheckBoxLabel><CheckBox multiple value="soccer"/> Soccer</CheckBoxLabel>
                                    <CheckBoxLabel><CheckBox multiple value="football"/> Football</CheckBoxLabel>
                                </ErrorContainer>
                                <FieldErrors/>
                            </SingleField>
                        </Mount>
                    </FieldRow>
                    <FieldRow>
                        <Mount path="gender">
                            <DirtyLabel htmlFor={false}>Gender</DirtyLabel>
                            <SingleField>
                                <ErrorContainer>
                                    <RadioLabel><RadioButton value="M"/> Male</RadioLabel>
                                    <RadioLabel><RadioButton value="F"/> Female</RadioLabel>
                                    <RadioLabel><RadioButton value="O"/> Other</RadioLabel>
                                </ErrorContainer>
                                <FieldErrors/>
                            </SingleField>
                        </Mount>
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
                    {formData !== undefined ? <JsonCode>
                        {JSON.stringify(formData, null, 2)}
                    </JsonCode> : <em>No form data</em>}
                </div>
            </div>
        )
    }
});
