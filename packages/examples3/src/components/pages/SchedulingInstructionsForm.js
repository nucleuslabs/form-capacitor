import {Fragment} from "react";
import {
    Title,
    Control,
    Label,
    // InputText,
    Icon,
    // Button,
    // Input,
    // HelpText,
    // Select,
    // Radio,
    // RadioMenu,
    // Snippet,
    // SnippetPreview,
    // Content,
    // ExternalLink,
    Field,
    // Para,
    Table,
    TableHead,
    TableHeadCell,
    TableRow,
    TableBody,
    // TableCell,
    // ActionLink,
    ActionButton,
    ButtonBar,
    Code,
    Title4,
} from "../bulma";
// import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import addIcon from "../../icons/fa/solid/plus-circle.svg";
import restoreIcon from "../../icons/fa/solid/sync-alt.svg";
import saveIcon from "../../icons/fa/regular/save.svg";
import clearIcon from "../../icons/fa/solid/eraser.svg";
// import css from '../bulma/bulma.scss';
import shortid from "shortid";
import {schema} from "../../form-capacitor";
import SchedulingInstruction from "./SchedulingInstruction";
import jsonSchema from "../../schemas/scheduling-instructions.json";
import {TextArea} from "../controls";
import FormErrors from "./FormErrors";
import {scuChildren} from '../../lib/react';
import DateSelector from "../controls/DateSelector";
import TimeSelector from "../controls/TimeSelector";
import DateTimeSelector from "../controls/DateTimeSelector";

// function Instruction(defaults) {
//     // Object.assign(this,{
//     //     typeId: null,
//     //     teamId: null,
//     //     disciplineId: null,
//     //     prefClinicianId: null,
//     //     prefTime: null,
//     //     childRequired: false,
//     //     ...defaults,
//     //     key: shortid()
//     // });
//     return {
//         typeId: null,
//         teamId: null,
//         disciplineId: null,
//         prefClinicianId: null,
//         prefTime: null,
//         childRequired: false,
//         ...defaults,
//         key: shortid(),
//     };
// }

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

// @mount({
//     defaultValue: {
//         // requiredAssessments: [Instruction()],
//         // specialInstructions: '',
//     }
// })
@schema({
    schema: jsonSchema,
    $ref: "#/definitions/SchedulingInstructions",
    default: {
        startDate: null,
    },
    actions: formData => ({
        addInstruction() {
            formData.requiredAssessments.push({});
        },
        clearInstructions() {
            formData.requiredAssessments.length = 0;
        },
        deleteInstruction(idx) {
            formData.requiredAssessments.splice(idx, 1);
        },
    }),
})
// @observer
// @connect({
//     propName: 'formData',
// })
export default class SchedulingInstructionsForm extends React.Component {
    formId = shortid();

    // @action.bound
    // addInstruction(ev) {
    //     this.formData.requiredAssessments.push(Instruction());
    // }
    //
    // @action.bound
    // clearInstructions(ev) {
    //     this.formData.requiredAssessments = [];
    // }
    //
    // deleteInstruction = idx => action(ev => {
    //     this.formData.requiredAssessments.splice(idx,1);
    // })
    //
    // saveState = ev => {
    //     this.saved = toJS(this.formData);
    // }
    //
    // @action.bound
    // restoreState(ev) {
    //     this.formData = this.saved;
    // }

    componentDidMount() {
        setTimeout(() => {
            // console.log(this.props);
            if(this.props.formData) {
                this.props.formData.set("specialInstructions", "foo");
                // this.props.formData.set("startDate", new Date(2015,12,14));
            }
        }, 1000);
    }

    render() {
        const {formData, errorMap, schema} = this.props;
        if(!formData) return <p>Loading schema...</p>;
        // console.log('formData',formData)

        // if(!this.formData.requiredAssessments) return null; // fixme: remove when schema loading is dealt with
        // console.log(this.formData.requiredAssessments.length);
        // const formData = toJS(this.formData);
        // console.log(toJS(this.errorMap));
        // console.log(this.errorMap);
        // console.log(this.formData);
        return (
            <Fragment>
                <Title>Scheduling Instructions</Title>

                <Title4>Required Assements</Title4>

                <Table isStriped isNarrow isFullWidth>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell>#</TableHeadCell>
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
                        {formData.requiredAssessments.map((inst, idx) => {
                            // console.log(inst.key);
                            // console.log(JSON.stringify(inst),inst.key,JSON.stringify(inst.key),toJS(inst.key),toJS(inst).key);
                            return <WrapSchedulingInstruction key={inst.key} index={idx} formData={formData} formId={this.formId}/>;
                        })}
                    </TableBody>
                </Table>

                <ButtonBar>
                    <ActionButton isPrimary onClick={formData.addInstruction}>
                        <Icon src={addIcon}/>
                        <span>Add Instruction</span>
                    </ActionButton>
                    <ActionButton isDanger onClick={formData.clearInstructions}>
                        <Icon src={clearIcon}/>
                        <span>Clear</span>
                    </ActionButton>
                </ButtonBar>

                <Field>
                    <Label htmlFor={`specialInstructions--${this.formId}`}>Special Instructions</Label>
                    <Control>
                        <TextArea id={`specialInstructions--${this.formId}`} name="specialInstructions" placeholder="Special scheduling instructions..."/>
                        {/*{formData.specialInstructions}*/}
                        {/*<textarea value={formData.specialInstructions} onChange={ev => formData.set('specialInstructions',ev.target.value)}/>*/}
                    </Control>
                </Field>
                <Field>
                    <Label htmlFor={`startDate--${this.formId}`}>Start Date</Label>
                    <Control>
                        <div style={{width: "120px"}}><DateSelector id={`startDate--${this.formId}`} name="startDate"/></div>
                    </Control>
                </Field>

                <Field>
                    <Label htmlFor={`startTime--${this.formId}`}>Start Time</Label>
                    <Control>
                        <TimeSelector id={`startTime--${this.formId}`} name="startTime"/>
                    </Control>
                </Field>


                <Field>
                    <Label htmlFor={`endDateTime--${this.formId}`}>End Date Time</Label>
                    <Control>
                        <DateTimeSelector id={`endDateTime--${this.formId}`} name="endDateTime"/>
                    </Control>
                </Field>

                <FormErrors schema={schema} errors={errorMap}/>

                <ButtonBar>
                    <ActionButton isSuccess onClick={this.saveState}>
                        <Icon src={saveIcon}/>
                        <span>Save</span>
                    </ActionButton>
                    <ActionButton onClick={this.restoreState}>
                        <Icon src={restoreIcon}/>
                        <span>Reset</span>
                    </ActionButton>
                </ButtonBar>

                <Code>{JSON.stringify(formData, null, 2)}</Code>
                <Code>{JSON.stringify(errorMap, null, 2)}</Code>
            </Fragment>
        );
    }
}

class WrapSchedulingInstruction extends React.Component {
    shouldComponentUpdate = scuChildren;

    render() {
        const {index, formData, formId} = this.props;

        return <SchedulingInstruction name={["requiredAssessments", index]} doDelete={() => formData.deleteInstruction(index)} formId={formId} number={index + 1}/>;
    }
}
