import {default as schema} from '../src/schema';
import {default as consumeValue} from '../src/consume';
import * as React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait} from "react-testing-library";

@consumeValue()
class SimpleTextBox extends React.Component {
    handleChange = ev => {
        this.props.fc.set(ev.target.value || undefined);
    };

    render() {
        const {fc, value, ...props} = this.props;
        return <input type="text" {...props} className={fc.hasErrors ? "error" : null} value={value || ""} onChange={this.handleChange}/>;
    }
}

@schema({
    schema: jsonSchema,
    $ref: "#/definitions/DemoForm",
    default: {
        lastName: "Bar",
        alias: []
    },
    actions: formData => ({
        addAlias(alias) {
            formData.alias.push({alias: alias});
        },
        clearAliases() {
            formData.alias.length = 0;
        },
        spliceAlias(idx) {
            formData.alias.splice(idx, 1);
        },
    }),
})
class DemoForm extends React.Component {
    render() {
        if(!this.props.formData){
            return null;
        }
        const {formData} = this.props;
        return (
            <div>
                <div>
                    <span>First Name</span>
                    <SimpleTextBox data-testid="firstName" name="firstName"/>
                </div>
                <div>
                    <span>Last Name</span>
                    <SimpleTextBox data-testid="lastName" name="lastName"/>
                </div>
                <ul data-testid="alias">
                    {formData.alias.map((obj,idx)=> <li key={idx}>{obj.alias}</li>)}
                </ul>
                <div>
                    <button onClick={() => formData.addAlias("Joe")}>+</button>
                    <button onClick={() => formData.alias.length > 0 && formData.spliceAlias(formData.alias.length-1)}>-</button>
                </div>
            </div>
        );
    }
}

// afterEach(cleanup);

test("Demo Form Should have a lastName text input which is equal to \"Bar\" if we change it to \"Baracus\" it should change", async () => {
    let {getByTestId} = render(<DemoForm/>);
    await wait(() => getByTestId("lastName"));
    let input = getByTestId("lastName");
    expect(input.value).toBe('Bar');
    fireEvent.change(input, {target: {value: 'Baracus'}});
    expect(input.value).toBe('Baracus');
});

test("Demo Form Should have a firstName text input that has a className of error if it is empty. ", async () => {
    let {getByTestId} = render(<DemoForm/>);
    await wait(() => getByTestId("firstName"));
    let input = getByTestId("firstName");
    fireEvent.change(input, {target: {value: 'B.A.'}});
    expect(input.value).toBe('B.A.');
    fireEvent.change(input, {target: {value: ''}});
    expect(input.className).toBe('error');
});

test("Demo Form Should have buttons that use schema actions to make aliases called 'Joe' and other buttons with actions to remove them.", async () => {
    let {getByTestId, getByText} = render(<DemoForm/>);
    await wait(() => getByText("+"));
    let aliasUl = getByTestId("alias");
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].textContent).toBe('Joe');
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(2);
    expect(aliasUl.childNodes[1].textContent).toBe('Joe');
    fireEvent.click(getByText("-"));
    expect(aliasUl.childNodes.length).toBe(1);
    fireEvent.click(getByText("-"));
    expect(aliasUl.childNodes.length).toBe(0);
});
