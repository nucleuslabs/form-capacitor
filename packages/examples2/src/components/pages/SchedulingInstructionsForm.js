import {Fragment} from 'react';
import {
    Title,
    Control,
    FieldBody,
    FieldLabel,
    Label,
    InputText,
    Icon,
    Button,
    Input,
    HelpText,
    Select,
    Radio, RadioMenu, TextArea, Snippet, SnippetPreview, Content,
    ExternalLink,
    Field, Para, Table, TableHead, TableHeadCell, TableRow, TableBody, TableCell, ActionLink, ActionButton,
    ButtonBar, Code
} from '../bulma';
// import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import trashIcon from '../../icons/fa/regular/trash-alt.svg';
import addIcon from '../../icons/fa/regular/plus-hexagon.svg';
import restoreIcon from '../../icons/fa/regular/sync-alt.svg';
import saveIcon from '../../icons/fa/regular/save.svg';
import clearIcon from '../../icons/fa/regular/eraser.svg';
// import css from '../bulma/bulma.scss';
import * as options from '../../options';
import {appointmentTypes} from '../../../../form-capacitor-examples/src/options';
import {observer} from 'mobx-react';
import {observable,extendObservable,toJS,action} from 'mobx';
import shortid from 'shortid';
import {connect,mount} from '../../form-capacitor';
import SchedulingInstruction from './SchedulingInstruction';

function Instruction(defaults) {
    // Object.assign(this,{
    //     typeId: null,
    //     teamId: null,
    //     disciplineId: null,
    //     prefClinicianId: null,
    //     prefTime: null,
    //     childRequired: false,
    //     ...defaults,
    //     key: shortid()
    // });
    return {
        typeId: null,
        teamId: null,
        disciplineId: null,
        prefClinicianId: null,
        prefTime: null,
        childRequired: false,
        ...defaults,
        key: shortid()
    };
}

// @connect({dataPropName: "formData", initialData: p => ({
//         instructions: [new Instruction]
//     })})
// @ajaxLoader({
//     route: 'helloSteve.endpoint',
//     handler(data,props)  {
//         this.formData = data;
//    
//        
//         Object.assign(props.formData, data);
//     }
// })
//
//
// @mobxAjaxForm({
//     route: 'endpoint',
//     data: props => {
//         if(props.id) {
//             return {id: props.id}
//         }
//         return undefined;
//     },
//     initialData: () => ({
//         instructions: [new Instruction]
//     })
// })

@mount({
    defaultValue: {
        instructions: [Instruction()],
    }
})
@connect({
    propName: 'formData',

})
export default class SchedulingInstructionsForm extends React.Component {
    
    formId = shortid()
    
    @action.bound
    addInstruction(ev) {
        this.formData.instructions.push(Instruction());
    }

    @action.bound
    clearInstructions(ev) {
        this.formData.instructions = [];
    }
    
    deleteInstruction = idx => action(ev => {
        this.formData.instructions.splice(idx,1);
    })
    
    saveState = ev => {
        this.saved = toJS(this.formData);
    }

    @action.bound
    restoreState(ev) {
        this.formData = this.saved;
    }
    
    render() {
        const formData = toJS(this.formData);
        // console.log(this.formData);
        return (
            <Fragment>
                <Title>Scheduling Instructions</Title>

                <Table isStriped isNarrow isFullWidth>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell id={`appointment-type-header--${this.formId}`}>Appointment Type</TableHeadCell>
                            <TableHeadCell>Team</TableHeadCell>
                            <TableHeadCell>Discipline</TableHeadCell>
                            <TableHeadCell>Pref. Clinician</TableHeadCell>
                            <TableHeadCell>Pref. Time</TableHeadCell>
                            <TableHeadCell>Child Req'd?</TableHeadCell>
                            <TableHeadCell/>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.formData.instructions.map((inst,idx) => {
                            // console.log(inst.key);
                            // console.log(JSON.stringify(inst),inst.key,JSON.stringify(inst.key),toJS(inst.key),toJS(inst).key);
                            return <SchedulingInstruction key={inst.key} name={['instructions',idx]} doDelete={this.deleteInstruction(idx)} formId={this.formId} number={idx+1}/>;
                        })}
                    </TableBody>
                </Table>

                <ButtonBar>
                    <ActionButton isPrimary onClick={this.addInstruction}><Icon src={addIcon} /><span>Add Instruction</span></ActionButton>
                    <ActionButton isDanger onClick={this.clearInstructions}><Icon src={clearIcon} /><span>Clear</span></ActionButton>
                    <ActionButton isSuccess onClick={this.saveState}><Icon src={saveIcon} /><span>Save</span></ActionButton>
                    <ActionButton onClick={this.restoreState}><Icon src={restoreIcon} /><span>Restore</span></ActionButton>
                </ButtonBar>

                <Code>
                    {JSON.stringify(formData,null,2)}
                </Code>
            </Fragment>
        )
    }
}
