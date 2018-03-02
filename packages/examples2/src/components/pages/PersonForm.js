import {Fragment} from 'react';
import {Title,Control,FieldBody,FieldLabel,Label,InputText,Icon} from '../bulma';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import {Field} from '../bulma';
import user from '../../icons/fa/solid/user.svg';
import css from '../bulma/bulma.scss';

export default function HomePage() {
    return (
        <Fragment>
            <Title>Person Form</Title>
            <Field horizontal>
                <FieldLabel normal>
                    <Label>From</Label>
                </FieldLabel>
                <FieldBody>
                    <Field>
                        <Control expanded iconsLeft>
                            <InputText placeholder="Name"/>
                            <Icon src={user} className={[css['is-small'],css['is-left']]}/>
                        </Control>
                    </Field>
                    <Field>
                        <Control expanded iconsLeft iconsRight>
                            <InputText placeholder="Email"/>
                            <Icon small left>X</Icon>
                            <Icon small right>Y</Icon>
                        </Control>
                    </Field>
                </FieldBody>
            </Field>
        </Fragment>
    )
}