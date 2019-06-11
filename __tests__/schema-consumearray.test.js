import {default as schema} from '../src/schema';
import {consumeArrayValue, default as consumeValue} from '../src/consume';
import * as React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "react-testing-library";
import shortid from "shortid";

@consumeArrayValue()
class TextBoxArray extends React.Component {
    handleChange = idx => ev => {
        const lenDif = (this.props.value.length - 1) - idx;
        this.props.fc.set(this.props.value.slice(0, idx).concat([{alias: ev.target.value}], lenDif > 0 ? this.props.value.slice(idx, lenDif) : []));
    };

    render() {
        const {fc, value, name, ...props} = this.props;
        return <div>
            <div data-testid="alias">
                {value.map((inst, key) => <input key={key} type="text" {...props} className={fc.hasErrors ? "error" : null} name={`${name}.${key}`} value={inst.alias || ""}
                                                 onChange={this.handleChange(key)}/>)}
            </div>
            <button onClick={() => fc.push({alias: "Joe"})}>+</button>
            <button onClick={() => value.length > 0 && fc.remove(value[value.length - 1])}>-</button>
            <button onClick={() => fc.clear()}>clear</button>
            <button onClick={() => fc.replace([{alias: "NOT JOE"}])}>replace</button>
        </div>;
    }
}

@schema({
    schema: jsonSchema,
    $ref: "#/definitions/DemoForm",
    default: {
        firstName: "Foo",
        lastName: "Bar",
        alias: []
    }
})
class DemoForm extends React.Component {
    render() {
        if(!this.props.formData) {
            return null;
        }
        return (
            <div>
                <TextBoxArray name="alias"/>
            </div>
        );
    }
}

afterEach(cleanup);

test("Demo Form Should have buttons that use schema actions to make aliases called 'Joe' and other buttons with actions to remove them.", async () => {
    let {getByTestId, getByText} = render(<DemoForm/>);
    await wait(() => getByText("+"));
    let aliasUl = getByTestId("alias");
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].value).toBe('Joe');
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(2);
    expect(aliasUl.childNodes[1].value).toBe('Joe');
    fireEvent.click(getByText("-"));
    expect(aliasUl.childNodes.length).toBe(1);
    fireEvent.click(getByText("-"));
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    fireEvent.click(getByText("+"));
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(3);
    fireEvent.click(getByText("clear"));
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("replace"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].value).toBe('NOT JOE');
});

@consumeArrayValue()
class TextBoxArray2 extends React.Component {
    handleChange = idx => ev => {
        const lenDif = (this.props.value.length - 1) - idx;
        this.props.fc.set(this.props.value.slice(0, idx).concat([{alias: ev.target.value}], lenDif > 0 ? this.props.value.slice(idx, lenDif) : []));
    };

    render() {
        const {fc, value, name, ...props} = this.props;
        return <div>
            <div data-testid="alias">
                {value.map((inst, key) => {
                    return <input key={key} type="text" {...props} className={fc.hasErrors ? "error" : null} name={`${name}.${key}`} value={inst || ""} onChange={this.handleChange(key)}/>;
                })}
            </div>
            <button onClick={() => fc.push("Joe")}>+</button>
            <button onClick={() => {
                try {
                    fc.push(22);
                } catch(err) {
                    if(err.message.includes('Error while converting `22` to `string`')) {
                        fc.push("Jordan");
                    }
                }
            }}>x
            </button>
            <button onClick={() => {
                try {
                    fc.push({alias: 'wut?'});
                } catch(err) {
                    if(err.message.includes('Error while converting `{"alias":"wut?"}` to `string`')) {
                        fc.push("Tyson");
                    }
                }
            }}>!
            </button>
            <button onClick={() => value.length > 0 && fc.remove(value[value.length - 1])}>-</button>
            <button onClick={() => fc.clear()}>clear</button>
            <button onClick={() => fc.replace(["NOT JOE"])}>replace</button>
        </div>;
    }
}

@schema({
    schema: jsonSchema,
    $ref: "#/definitions/DemoForm",
    default: {
        firstName: "Foo",
        lastName: "Bar",
        alias: []
    }
})
class DemoForm2 extends React.Component {
    render() {
        if(!this.props.formData) {
            return null;
        }
        return (
            <div>
                <TextBoxArray2 name="alias2"/>
                <span data-testid="alexa">{this.props.formData.alias2.map(a2 => a2)}</span>
            </div>
        );
    }
}


//Very intense test of how form capacitor handles arrays of simple strings
test("Demo Form 2 Should have buttons that use schema actions to make aliases called 'Joe' and other buttons with actions to remove them.", async () => {
    let {getByTestId, getByText} = render(<DemoForm2/>);
    await wait(() => getByText("+"));
    let aliasUl = getByTestId("alias");
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].value).toBe('Joe');
    fireEvent.click(getByText("+"));
    // console.log(aliasUl.childNodes[0]);
    expect(aliasUl.childNodes.length).toBe(2);
    expect(aliasUl.childNodes[0].value).toBe('Joe');
    fireEvent.click(getByText("-"));
    expect(aliasUl.childNodes.length).toBe(1);
    fireEvent.click(getByText("-"));
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    fireEvent.click(getByText("+"));
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(3);
    fireEvent.click(getByText("clear"));
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("replace"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].value).toBe('NOT JOE');

    //Lets make some errs!!!
    fireEvent.click(getByText("x"));
    expect(aliasUl.childNodes[1].value).toBe("Jordan");

    fireEvent.click(getByText("!"));
    expect(aliasUl.childNodes[2].value).toBe("Tyson");

    fireEvent.click(getByText("replace"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].value).toBe('NOT JOE');
});


@consumeValue()
class SimpleTextBox extends React.Component {
    handleChange = ev => {
        if(isNaN(ev.target.value)) {
            this.props.fc.set(ev.target.value || undefined);
        } else {
            this.props.fc.set(parseInt(ev.target.value, 10));
        }
    };

    render() {
        const {fc, value, ...props} = this.props;
        return <input type="text" {...props} className={fc.hasErrors ? "error" : null} value={value || ""} onChange={this.handleChange}/>;
    }
}


@consumeArrayValue()
class Contacts extends React.Component {
    render() {
        let {value, removeContact} = this.props;

        return <div>
            {value.map((contact, idx) => <Contact key={idx} number={idx + 1} name={idx} removeHandler={() => removeContact(idx)} contact={contact}/>)}
        </div>;
    }
}

@consumeValue()
class Contact extends React.Component {
    contactId = shortid();

    render() {
        let {number, name, contact} = this.props;
        return <div>
            <div style={{float: "right"}}>
                Contact #{number}
                <button data-testid={`contact.${name}.remove`} style={{float: "right"}} onClick={this.props.removeHandler}>x</button>
            </div>
            <div>
                <label htmlFor={`first--${this.contactId}`}>Name</label>
                <SimpleTextBox data-testid={`contact.${name}.first`} id={`first--${this.contactId}`} name="firstName" placeholder="First Name"/>
            </div>
            <div>
                <label htmlFor={`last--${this.contactId}`}>Name</label>
                <SimpleTextBox data-testid={`contact.${name}.last`} id={`last--${this.contactId}`} name="lastName" placeholder="Last Name"/>
            </div>
            <div>
                <label htmlFor={`phone--${this.contactId}`}>Phone</label>
                <SimpleTextBox data-testid={`contact.${name}.phone`} id={`phone--${this.contactId}`} name="phone" placeholder={1234567}/>
            </div>
            <div data-testid={`contact.${name}.phoneTest`}>{contact.phone === parseInt(contact.phone) && "Yas"}</div>
        </div>;
    }
}


@schema({
    schema: jsonSchema,
    $ref: "#/definitions/DemoForm",
    default: {
        firstName: "Foo",
        lastName: "Bar",
        alias: [],
        contacts: [{}]
    },
    actions: formData => ({
        addContact() {
            formData.contacts.push({});
        },
        removeContact(idx) {
            formData.contacts.splice(idx, 1);
        },
    }),
})
class AdvancedDemoForm extends React.Component {
    render() {
        if(!this.props.formData) {
            return null;
        }
        return (
            <div>
                <p><b>Contacts: <span data-testid={'contacts.count'}>{this.props.formData.contacts.length}</span></b></p>
                <hr/>
                <Contacts name={'contacts'} removeContact={this.props.formData.removeContact}/>
                <button data-testid={`contacts.add`} onClick={this.props.formData.addContact}>+</button>
                <button data-testid={`contacts.phoneTestButton`} onClick={this.props.formData.set("contacts.0.phone", 5555555)}>Test Phone Data Type</button>
            </div>
        );
    }
}


test("Advanced Demo Form Should have buttons that use schema actions to add and remove contacts.", async () => {
    let {getByTestId, getByText} = render(<AdvancedDemoForm/>);
    await wait(() => getByText("+"));
    const first = getByTestId("contact.0.first");
    const last = getByTestId("contact.0.last");
    // const phone = getByTestId("contact.0.phone");
    const phoneTest = getByTestId("contact.0.phoneTest");
    fireEvent.change(first, {target: {value: 'BA'}});
    fireEvent.change(last, {target: {value: 'Baracus'}});
    expect(first.value).toBe('BA');
    expect(last.value).toBe('Baracus');
    // expect(phoneTest.innerHTML).toBe('');
    fireEvent.click(getByTestId("contacts.add"));
    await wait(() => getByTestId("contact.1.first"));
    const first1 = getByTestId("contact.1.first");
    const last1 = getByTestId("contact.1.last");
    const remove = getByTestId("contact.1.remove");
    fireEvent.change(first1, {target: {value: 'HOWLIN MAD'}});
    fireEvent.change(last1, {target: {value: 'MURDOCK'}});
    expect(first1.value).toBe('HOWLIN MAD');
    expect(last1.value).toBe('MURDOCK');
    fireEvent.click(remove);
    const countSpan = getByTestId("contacts.count");
    expect(countSpan.innerHTML).toBe("1");
    fireEvent.click(getByTestId("contacts.phoneTestButton"));
    expect(phoneTest.innerHTML).toBe('Yas');//testing data type... should be an integer
});


@schema({
    schema: jsonSchema,
    $ref: "#/definitions/DemoForm",
    default: props => ({
        firstName: "Foo",
        lastName: "Bar",
        alias: props.alias
    })
})
class FunctionalDefaultsForm extends React.Component {
    render() {
        if(!this.props.formData) {
            return null;
        }
        return (
            <div>
                <TextBoxArray name="alias"/>
            </div>
        );
    }
}

test("FunctionalDefaultsForm Form Should have defaults set for aliases and it should still function normally after defaults are set.", async () => {
    let {getByTestId, getByText} = render(<FunctionalDefaultsForm alias={[{alias: "Mubarak"}, {alias: "Anthony"}, {alias: "Jughead"}]}/>);
    await wait(() => getByText("+"));
    let aliasUl = getByTestId("alias");
    expect(aliasUl.childNodes.length).toBe(3);
    fireEvent.click(getByText("clear"));
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].value).toBe('Joe');
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(2);
    expect(aliasUl.childNodes[1].value).toBe('Joe');
    fireEvent.click(getByText("-"));
    expect(aliasUl.childNodes.length).toBe(1);
    fireEvent.click(getByText("-"));
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    fireEvent.click(getByText("+"));
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(3);
    fireEvent.click(getByText("clear"));
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("replace"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].value).toBe('NOT JOE');
});