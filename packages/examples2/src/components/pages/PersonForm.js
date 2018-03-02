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
    Radio, RadioMenu
} from '../bulma';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import {Field} from '../bulma';
import user from '../../icons/fa/solid/user.svg';
import check from '../../icons/fa/solid/check.svg';
import email from '../../icons/fa/solid/envelope.svg';
// import css from '../bulma/bulma.scss';

export default function HomePage() {
    return (
        <Fragment>
            <Title>Person Form</Title>
            
            <Field isHorizontal>
                <FieldLabel isNormal>
                    <Label>From</Label>
                </FieldLabel>
                <FieldBody>
                    <Field>
                        <Control isExpanded hasIconsLeft>
                            <InputText placeholder="Name"/>
                            <Icon src={user} isSmall isLeft/>
                        </Control>
                    </Field>
                    <Field>
                        <Control isExpanded hasIconsLeft hasIconsRight>
                            <InputText placeholder="Email"/>
                            <Icon src={email} isSmall isLeft/>
                            <Icon src={check} isSmall isRight/>
                        </Control>
                    </Field>
                </FieldBody>
            </Field>

            <Field isHorizontal>
                <FieldLabel />
                <FieldBody>
                    <Field isExpanded>
                        <Field hasAddons>
                            <Control>
                                <Button isStatic>+1</Button>
                            </Control>
                            <Control isExpanded>
                                <Input type="tel" placeholder="Your phone number"/>
                            </Control>
                        </Field>
                        <HelpText>Do not enter the first zero</HelpText>
                    </Field>
                    
                </FieldBody>
            </Field>
            
            <Field isHorizontal>
                <FieldLabel isNormal>
                    <Label>Department</Label>
                </FieldLabel>
                <FieldBody>
                    <Field isNarrow>
                        <Control>
                            <Select isFullwidth>
                                <option>Business development</option>
                                <option>Marketing</option>
                                <option>Sales</option>
                            </Select>
                        </Control>
                    </Field>
                </FieldBody>
            </Field>

            <Field isHorizontal>
                <FieldLabel>
                    <Label>Already a member?</Label>
                </FieldLabel>
                <FieldBody>
                    <Field isNarrow>
                        <Control>
                            <RadioMenu>
                                <Radio value={1}>Yes</Radio>
                                <Radio value={0}>No</Radio>
                            </RadioMenu>
                        </Control>
                    </Field>
                </FieldBody>
            </Field>
        </Fragment>
    )
}