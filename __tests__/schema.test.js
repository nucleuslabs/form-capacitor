import {default as schema} from '../src/schema';
import {default as consumeValue} from '../src/consume';
import * as React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";

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
                    <button data-testid="bfn" onClick={() => formData.set("firstName", "Joe")}>Set First Name</button>
                    <button data-testid="bln" onClick={() => formData.set("lastName", "Dirt")}>Set Last Name</button>
                    <button data-testid="ba" onClick={() => formData.set("alias",[{alias: 'Charlie'},{alias:'Roger'}])}>Set Aliases</button>
                    <button data-testid="breset" onClick={() => formData.reset()}>Reset</button>
                    <button data-testid="breplace" onClick={() => formData.replace({firstName: "Doge"})}>Replace</button>
                </div>
            </div>
        );
    }
}

afterEach(cleanup);

test("The Set First Name button should set the first name to \"Joe\"", async () => {
    let {getByTestId} = render(<DemoForm/>);
    await wait(() => getByTestId("lastName"));

    const inputFN = getByTestId("firstName");
    expect(inputFN.value).toBe('');
    const buttonFN = getByTestId("bfn");
    fireEvent.click(buttonFN);
    expect(inputFN.value).toBe('Joe');

    const buttonLN = getByTestId("bln");
    fireEvent.click(buttonLN);
    expect(inputFN.value).toBe('Joe');
    const inputLN = getByTestId("lastName");
    const buttonA = getByTestId("ba");
    expect(inputLN.value).toBe('Dirt');

    const aliasUl = getByTestId("alias");
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(buttonA);
    expect(aliasUl.childNodes.length).toBe(2);

    const buttonReplace = getByTestId("breplace");
    fireEvent.click(buttonReplace);
    expect(aliasUl.childNodes.length).toBe(0);
    expect(inputFN.value).toBe('Doge');

    const buttonReset = getByTestId("breset");
    fireEvent.click(buttonReset);
    expect(inputLN.value).toBe('Bar');

});
