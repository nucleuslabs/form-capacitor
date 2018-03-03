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
    Field, Para, Table, TableHead, TableHeadCell, TableRow, TableBody, TableCell
} from '../bulma';
// import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import user from '../../icons/fa/solid/user.svg';
import check from '../../icons/fa/solid/check.svg';
import email from '../../icons/fa/solid/envelope.svg';
// import css from '../bulma/bulma.scss';

export default function SchedulingInstructionsForm() {
    return (
        <Fragment>
            <Title>Scheduling Instructions</Title>


            <Snippet>
                <SnippetPreview>
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
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                            </TableRow>
                            <TableRow isSelected>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                                <TableCell>X</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </SnippetPreview>
            </Snippet>
        </Fragment>
    )
}