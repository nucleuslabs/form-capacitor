import {Fragment} from 'react';
import {
    Title,
    Control,
    FieldBody,
    FieldLabel,
    Label,
  
    Icon,
    Button,

    HelpText,
    Select,
    RadioMenu, Snippet, SnippetPreview, Content,
    ExternalLink,
    Field, Para, Table, TableHead, TableHeadCell, TableRow, TableBody, TableCell, Checkbox, ActionLink, ActionButton,
    ButtonBar
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
import {observable,extendObservable,toJS} from 'mobx';
import shortid from 'shortid';
import connect from '../../form-capacitor/connect';
import {mount} from '../../form-capacitor';

import {TextBox, SelectBox, EmailInput, TelInput, Radio, TextArea} from '../controls';


function SchedulingInstruction({doDelete}) {
    return (
        <TableRow isMiddleAligned>
            <TableCell>
                <SelectBox name="typeId">
                    {options.appointmentTypes.map(({value, label}) => <option key={value}>{label}</option>)}
                </SelectBox>
            </TableCell>
            <TableCell>
                <SelectBox name="teamId">
                    {options.teams.map(({value, label}) => <option key={value}>{label}</option>)}
                </SelectBox>
            </TableCell>
            <TableCell>
                <SelectBox name="disciplineId">
                    {options.disciplines.map(({value, label}) => <option key={value}>{label}</option>)}
                </SelectBox>
            </TableCell>
            <TableCell>
                <SelectBox name="prefClinicianId">
                    {options.clinicians.map(({value, label}) => <option key={value}>{label}</option>)}
                </SelectBox>
            </TableCell>
            <TableCell>
                <SelectBox name="prefTime">
                    {options.times.map(({value, label}) => <option key={value}>{label}</option>)}
                </SelectBox>
            </TableCell>
            <TableCell>
                <Checkbox name="childRequired">Yes</Checkbox>
            </TableCell>
            <TableCell>
                <ActionLink hasTextDanger onClick={doDelete}><Icon src={trashIcon} isMedium/></ActionLink>
            </TableCell>
        </TableRow>
    )
}

export default mount({})(SchedulingInstruction);
// export default SchedulingInstruction;