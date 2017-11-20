import React from 'react';
import {
   SubmitButton, Button,
    Title, Buttons
} from '../bulma';
import createComponent from '../../createComponent';
import {withValue, mountPoint} from 'form-capacitor-state';
import {dirtyProvider, withDirty} from 'form-capacitor-dirty';
import {withHandlers, withState} from 'recompose';
import {arraySplice, formatDate} from '../../util';
import JsonCode from '../JsonCode';
import {isEqual} from 'lodash';
import SchedulingInstruction from './SchedulingInstruction';
import shortid from 'shortid';
import onMount from '../../onMount';
import * as Sch from '../../SchemaTypes';
import {withSchema} from '../../../../form-capacitor-schema/src';
import FieldErrors from '../fields/FieldErrors';


function Instruction(defaults) {
    return {
        typeId: null,
        teamId: null,
        disciplineId: null,
        prefClinicianId: 999,
        prefTime: null,
        childRequired: false,
        ...defaults,
    }
}

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
            valueProp: 'formData',
            setValueProp: 'setData',
        }), // try with {name: 'person'}
        dirtyProvider({
            resetStateProp: 'resetState',
            saveStateProp: 'saveState',
        }),
        onMount(({setData, saveState}) => {
            setData({
                instructions: [Instruction()],
            });
            saveState();
        }),
        withDirty({
            // path: null, // FIXME: it's weird to have to pass `null` here
            compare: isEqual,
        }),
        withSchema({
            schema: Sch.object({
                required: ['instructions'],
                properties: {
                    instructions: Sch.arrayOf(Sch.object({
                        required: ['typeId', 'teamId', 'disciplineId'],
                        properties: {
                            typeId: Sch.id(),
                            teamId: Sch.id(),
                            disciplineId: Sch.id(),
                            prefClinicianId: Sch.optional(Sch.id()),
                            prefTime: Sch.optional(Sch.int()),
                            childRequired: Sch.bool(),
                        }
                    }))
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
            deleteInstruction: ({formData, setData}) => idx => ev => {
                ev.preventDefault();
                setData({...formData, instructions: arraySplice(formData.instructions, idx)});
            },
            addInstruction: ({formData, setData}) => ev => {
                ev.preventDefault();
                setData({
                    ...formData, instructions: [...formData.instructions, Instruction()]
                });
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
                            {formData && formData.instructions && formData.instructions.length
                                ? formData.instructions.map((inst, i) =>
                                    <SchedulingInstruction key={i} data={inst} name={`instructions.${i}`} remove={deleteInstruction(i)}/>)
                                : <tr>
                                    <td colSpan={7} className="has-text-centered">No instructions.</td>
                                </tr>
                            }
                        </tbody>
                    </table>

                    <FieldErrors/>

                    <Buttons>
                        <Button onClick={addInstruction} info>Add</Button>
                        <SubmitButton primary disabled={saving} className={{'is-loading': saving}}>Save</SubmitButton>
                        <Button onClick={resetState} disabled={!isDirty}>Reset</Button>
                    </Buttons>
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
