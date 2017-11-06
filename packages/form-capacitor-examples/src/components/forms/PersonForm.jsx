import React from 'react';
import {
    CheckBoxLabel, Control, SingleField, FieldLabel, FieldRow, Title1, RadioLabel, SubmitButton, Button,
    Title2, Title, Buttons
} from '../bulma';
import TextBox from '../fields/TextBox';
import createComponent from '../../createComponent';
import {withValue} from 'form-capacitor-state';
import {dirtyProvider,withDirty} from 'form-capacitor-dirty';
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

const primaryLanguages = [pleaseSelect, ...languages];

export default createComponent({
    displayName: "PersonForm",
    enhancers: [
        withValue({
            defaultValue: {
                name: "Mark",
                favNum: null,
                birthDate: "1987-12-21",
                primaryLanguageId: null,
                secondaryLanguageIds: [12,3],
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
        withState('saving', 'setSaving', false),
        withHandlers({
            resetState: props => ev => {
                ev.preventDefault();
                props.resetState();
            },
            saveState: props => ev => {
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
        // console.log('render',formData);
        return (
            <div>
                <form>
                    <Title>Person Form</Title>
                    <FieldRow>
                        <DirtyLabel normal for="name">Name</DirtyLabel>
                        <SingleField>
                            <TextBox name="name"/>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <DirtyLabel normal for="favNum">Favourite Number</DirtyLabel>
                        <SingleField narrow>
                            <NumberBox name="favNum" />
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
                        <DirtyLabel for="isAboriginal">Aboriginal?</DirtyLabel>
                        <SingleField>
                            <Control>
                                <CheckBoxLabel><CheckBox name="isAboriginal" /> Aboriginal</CheckBoxLabel>
                            </Control>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <DirtyLabel for="likes" htmlFor={false}>Likes</DirtyLabel>
                        <SingleField>
                            <Control>
                                <CheckBoxLabel><CheckBox multiple name="likes" value="hockey"/> Hockey</CheckBoxLabel>
                                <CheckBoxLabel><CheckBox multiple name="likes" value="soccer"/> Soccer</CheckBoxLabel>
                                <CheckBoxLabel><CheckBox multiple name="likes" value="football"/> Football</CheckBoxLabel>
                            </Control>
                        </SingleField>
                    </FieldRow>
                    <FieldRow>
                        <DirtyLabel for="gender" htmlFor={false}>Gender</DirtyLabel>
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
                            <Buttons>
                                <Button onClick={saveState} primary disabled={saving} className={{'is-loading': saving}}>Save</Button>
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
