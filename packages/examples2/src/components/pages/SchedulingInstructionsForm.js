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
    Field, Para, Table, TableHead, TableHeadCell, TableRow, TableBody, TableCell, Checkbox, ActionLink
} from '../bulma';
// import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import trashCan from '../../icons/fa/regular/trash-alt.svg';
// import css from '../bulma/bulma.scss';
import * as options from '../../options';
import {appointmentTypes} from '../../../../form-capacitor-examples/src/options';

export default function SchedulingInstructionsForm() {
    return (
        <Fragment>
            <Title>Scheduling Instructions</Title>


            <Table isStriped isNarrow isFullwidth>
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Appointment Type</TableHeadCell>
                        <TableHeadCell>Team</TableHeadCell>
                        <TableHeadCell>Discipline</TableHeadCell>
                        <TableHeadCell>Pref. Clinician</TableHeadCell>
                        <TableHeadCell>Pref. Time</TableHeadCell>
                        <TableHeadCell>Child Req'd?</TableHeadCell>
                        <TableHeadCell/>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            <Select>
                                {options.appointmentTypes.map(({value, label}) => <option key={value}>{label}</option>)}
                            </Select>
                        </TableCell>
                        <TableCell>
                            <Select>
                                {options.teams.map(({value, label}) => <option key={value}>{label}</option>)}
                            </Select>
                        </TableCell>
                        <TableCell>
                            <Select>
                                {options.disciplines.map(({value, label}) => <option key={value}>{label}</option>)}
                            </Select>
                        </TableCell>
                        <TableCell>
                            <Select>
                                {options.clinicians.map(({value, label}) => <option key={value}>{label}</option>)}
                            </Select>
                        </TableCell>
                        <TableCell>
                            <Select>
                                {options.times.map(({value, label}) => <option key={value}>{label}</option>)}
                            </Select>
                        </TableCell>
                        <TableCell alignMiddle>
                            <Checkbox>Yes</Checkbox>
                        </TableCell>
                        <TableCell alignMiddle>
                            <ActionLink hasTextDanger><Icon src={trashCan} isMedium/></ActionLink>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
           
        </Fragment>
    )
}