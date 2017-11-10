import React from 'react';
import {
    CheckBoxLabel, Control, SingleField, FieldLabel, FieldRow, Title1, RadioLabel, SubmitButton, Button,
    Title2, Title, Buttons
} from '../bulma';
import TextBox from '../fields/TextBox';
import createComponent from '../../createComponent';
import {withValue,mountPoint} from 'form-capacitor-state';
import {dirtyProvider,withDirty} from 'form-capacitor-dirty';
import {withHandlers, withState} from 'recompose';
import DirtyLabel from '../fields/DirtyLabel';
import NumberBox from '../fields/NumberBox';
import {arraySplice, formatDate} from '../../util';
import DatePicker from '../fields/DatePicker';
import {languages, pleaseSelect} from '../../options';
import SelectBox from '../fields/SelectBox';
import JsonCode from '../JsonCode';
import CheckBox from '../fields/CheckBox';
import {isEqual} from 'lodash';
import RadioButton from '../fields/RadioButton';
import SchedulingInstruction from './SchedulingInstruction';
import shortid from 'shortid';

const primaryLanguages = [pleaseSelect, ...languages];

export default createComponent({
    displayName: "SchedulingInstructionsForm",
    enhancers: [
        mountPoint({
            add: p => {
                return p.name || shortid();
            }, 
            expose: true
        }),
        withValue({
            defaultValue: {
                instructions: [{}],
            },
            valueProp: 'formData',
            setValueProp: 'setData',
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
                // console.log('hit');
                ev.preventDefault();
                props.setSaving(true);
                const formData = props.formData;
                setTimeout(() => { // simualte ajax save
                    props.saveState(formData); // store what we actually saved instead of the current state in case the user modified the form while we were saving
                    props.setSaving(false);
                }, 750);
            },
            deleteInstruction: ({formData,setData}) => idx => ev => {
                ev.preventDefault();
                setData({...formData, instructions: arraySplice(formData.instructions, idx)});
            },
            addInstruction: ({formData,setData}) => ev => {
                ev.preventDefault();
                setData({...formData, instructions: [...formData.instructions, {}]});
            }
        })
    ],
    render: ({saveState, resetState, deleteInstruction, formData, saving, isDirty, addInstruction}) => {
        return (
            <div>
                <form onSubmit={saveState}>
                    <Title>Scheduling Instructions</Title>

                    <table className="table is-striped is-narrow is-fullwidth">
                        <thead>
                            <tr>
                                <th>Appointment Type</th>
                                <th>Team</th>
                                <th>Discipline</th>
                                <th>Pref. Clinician</th>
                                <th>Pref. Time</th>
                                <th>Child Req'd?</th>
                                <th/>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.instructions.length
                                ? formData.instructions.map((inst, i) =>
                                    <SchedulingInstruction key={i} data={inst} name={`instructions.${i}`} remove={deleteInstruction(i)}/>)
                                : <tr><td colSpan={7} className="has-text-centered">No instructions.</td></tr>
                            }
                        </tbody>
                    </table>

                    <Buttons>
                        <Button onClick={addInstruction} info>Add</Button>
                        <SubmitButton primary disabled={saving} className={{'is-loading': saving}}>Save</SubmitButton>
                        <Button onClick={resetState} disabled={!isDirty}>Reset</Button>
                    </Buttons>
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
