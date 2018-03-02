import {Fragment} from 'react';
import {Title,Control,FieldBody,FieldLabel,Label,InputText,Icon} from '../bulma';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import {Field} from '../bulma';

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
                            <Icon small left>X</Icon>
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