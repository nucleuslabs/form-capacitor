import { Fragment } from "react";
import {
    Title,
    Control,
    FieldBody,
    FieldLabel,
    Label,
    Icon,
    Button,
    HelpText,
    RadioMenu,
    Snippet,
    SnippetPreview,
    Content,
    ExternalLink,
    Field,
    Para,
    Table,
    TableHead,
    TableHeadCell,
    TableRow,
    TableBody,
    TableCell,
    ActionLink,
    ActionButton,
    ButtonBar,
} from "../bulma";
// import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import trashIcon from "../../icons/fa/regular/trash-alt.svg";
import addIcon from "../../icons/fa/regular/plus-hexagon.svg";
import restoreIcon from "../../icons/fa/regular/sync-alt.svg";
import saveIcon from "../../icons/fa/regular/save.svg";
import clearIcon from "../../icons/fa/regular/eraser.svg";
// import css from '../bulma/bulma.scss';
import * as options from "../../options";
import { appointmentTypes } from "../../../../form-capacitor-examples/src/options";
import { observer } from "mobx-react";
import { observable, extendObservable, toJS } from "mobx";
import shortid from "shortid";
import connect from "../../form-capacitor/connect";
import { mount } from "../../form-capacitor";

import { TextBox, Select, EmailInput, TelInput, Radio, TextArea, Checkbox } from "../controls";
import { consumeValue } from "../../form-capacitor";

@consumeValue()
export default class SchedulingInstruction extends React.Component {
    render() {
        const { doDelete, number, formId, value: instruction } = this.props;
        // console.log('rerendering',number);

        return (
            <TableRow isMiddleAligned id={`instruction-${number}--${formId}`} aria-label={`Instruction ${number}`}>
                <TableCell>{number}</TableCell>
                <TableCell>
                    <Select name="typeId" isFullWidth aria-labelledby={`instruction-${number}--${formId} appointment-type-header--${formId}`} options={options.appointmentTypes} />
                </TableCell>
                <TableCell>
                    <Select name="teamId" isFullWidth options={options.teams} />
                </TableCell>
                <TableCell>
                    <Select name="disciplineId" isFullWidth options={options.disciplines} />
                </TableCell>
                <TableCell>
                    <Select name="prefClinicianId" isFullWidth options={options.clinicians} />
                </TableCell>
                <TableCell>
                    <Select name="prefTime" isFullWidth options={options.times} />
                </TableCell>
                <TableCell>
                    <Checkbox name="childRequired">Yes</Checkbox>
                </TableCell>
                <TableCell>
                    <ActionLink hasTextDanger onClick={doDelete}>
                        <Icon src={trashIcon} isMedium />
                    </ActionLink>
                </TableCell>
            </TableRow>
        );
    }
}

// export default mount({
//     defaultValue: {},
// })(SchedulingInstruction);
// export default SchedulingInstruction;
