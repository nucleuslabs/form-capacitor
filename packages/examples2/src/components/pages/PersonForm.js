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
    RadioMenu, TextArea, Snippet, SnippetPreview, Content,
    ExternalLink,
    Field, Para, Code, SnippetCode
} from '../bulma';
import {TextBox, SelectBox, EmailInput, TelInput, Radio} from '../controls';

// import {BrowserRouter, Switch, Route, Link} from 'react-router-dom';
import user from '../../icons/fa/solid/user.svg';
import check from '../../icons/fa/solid/check.svg';
import email from '../../icons/fa/solid/envelope.svg';
import connect from '../../form-capacitor/connect';
import {toJS} from 'mobx';
// import css from '../bulma/bulma.scss';

function HomePage({formData}) {
    return (
        <Fragment>
            <Title>Bulma horizontal form</Title>
            
            <Para>A basic form from the <ExternalLink href="https://bulma.io/documentation/form/general/#horizontal-form">Bulma documentation</ExternalLink>.</Para>
            
            <Snippet isHorizontal>
                <SnippetPreview>
                    <Field isHorizontal>
                        <FieldLabel isNormal>
                            <Label>From</Label>
                        </FieldLabel>
                        <FieldBody>
                            <Field>
                                <Control isExpanded hasIconsLeft>
                                    <TextBox name="name" placeholder="Name"/>
                                    <Icon src={user} isLeft/>
                                </Control>
                            </Field>
                            <Field>
                                <Control isExpanded hasIconsLeft hasIconsRight>
                                    <EmailInput name="email" placeholder="Email" defaultValue="@nucleuslabs.com"/>
                                    <Icon src={email} isLeft/>
                                    <Icon src={check} isRight/>
                                </Control>
                            </Field>
                        </FieldBody>
                    </Field>

                    <Field isHorizontal>
                        <FieldLabel/>
                        <FieldBody>
                            <Field isExpanded>
                                <Field hasAddons>
                                    <Control>
                                        <Button isStatic>+1</Button>
                                    </Control>
                                    <Control isExpanded>
                                        <TelInput name="phone" placeholder="Your phone number"/>
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
                                    <SelectBox name="department" placeholder="– Please Choose –">
                                        <option data-value={999} value="business-development">Business development</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="sales">Sales</option>
                                    </SelectBox>
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

                    <Field isHorizontal>
                        <FieldLabel isNormal>
                            <Label>Subject</Label>
                        </FieldLabel>
                        <FieldBody>
                            <Field>
                                <Control>
                                    <TextBox name="subject" isDanger placeholder="e.g. Partnership opportunity"/>
                                </Control>
                                <HelpText isDanger>This field is required.</HelpText>
                            </Field>
                        </FieldBody>
                    </Field>

                    <Field isHorizontal>
                        <FieldLabel>
                            <Label>Question</Label>
                        </FieldLabel>
                        <FieldBody>
                            <Field>
                                <Control>
                                    <TextArea placeholder="Explain how we can help you"/>
                                </Control>
                            </Field>
                        </FieldBody>
                    </Field>

                    <Field isHorizontal>
                        <FieldLabel/>
                        <FieldBody>
                            <Field>
                                <Control>
                                    <Button isPrimary>Send Message</Button>
                                </Control>
                            </Field>
                        </FieldBody>
                    </Field>
                </SnippetPreview>
                <SnippetCode>
                    <Code>
                        {JSON.stringify(formData,null,2)}
                    </Code>
                </SnippetCode>
            </Snippet>
        </Fragment>
    )
}

export default connect({
    propName: 'formData',
    initialValue: {
        name: "Mark",
        // department: "marketing"
    }
})(HomePage);