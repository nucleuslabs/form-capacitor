import {
    // Title,
    // Control,
    // FieldBody,
    // FieldLabel,
    // Label,
    Icon,
    // Button,
    // HelpText,
    // Snippet,
    // SnippetPreview,
    // Content,
    // ExternalLink,
    // Field,
    // Para,
    // Table,
    // TableHead,
    // TableHeadCell,
    TableRow,
    // TableBody,
    TableCell,
    ActionLink,
    // ActionButton,
    // ButtonBar,
} from "../bulma";
import trashIcon from "../../icons/fa/regular/trash-alt.svg";
import * as options from "../../options";

import { Select, RadioMenu, Checkbox, ReactSelect, ReactMultiSelect } from "../controls";
import { consumeValue } from "../../form-capacitor";
import * as React from "react";

@consumeValue()
export default class SchedulingInstruction extends React.Component {
    render() {
        const { doDelete, number, formId, value: instruction } = this.props;

        return (
            <TableRow isMiddleAligned id={`instruction-${number}--${formId}`} aria-label={`Instruction ${number}`}>
                <TableCell>{number}</TableCell>
                <TableCell>
                    <ReactSelect name="typeId" isFullWidth aria-labelledby={`instruction-${number}--${formId} appointment-type-header--${formId}`} options={options.appointmentTypes} />
                </TableCell>
                <TableCell>
                    <RadioMenu name="teamId" isFullWidth options={options.teams}/>
                </TableCell>
                <TableCell>
                    <RadioMenu name="disciplineId" isFullWidth options={options.disciplines} orientation={'horizontal'}/>
                </TableCell>
                <TableCell>
                    <ReactMultiSelect name="prefClinicianId" options={options.clinicians} placeholder="(None Preferred)"/>
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

