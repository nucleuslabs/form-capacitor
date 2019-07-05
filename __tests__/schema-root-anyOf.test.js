import {default as schema} from '../src/schema';
import {default as consumeValue} from '../src/consume';
import {errorMapToFlatArray} from "../src";
import * as React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "react-testing-library";

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
    constructor(props){
        super(props);
        this.state = {
            valid: 'Unknown',
            errors: []
        };
    }
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
                    <span>Middle Name</span>
                    <SimpleTextBox data-testid="middleName" name="middleName"/>
                </div>
                <div>
                    <span>AKA</span>
                    <SimpleTextBox data-testid="aka" name="aka"/>
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
                    <button data-testid="v" onClick={() => {
                        if(this.props.validate()) {
                            this.setState({valid: "VALID", errors: []});
                        } else {
                            this.setState({valid: "INVALID", errors: errorMapToFlatArray(this.props.errorMap) || []});
                        }
                    }}>Validate</button>
                </div>
                <div data-testid="valid">{this.state.valid}</div>
                <div data-testid="errors">{this.state.errors.length > 0 && this.state.errors.map(e => e.message)}</div>
            </div>
        );
    }
}

afterEach(cleanup);

test("The root anyOf keyword should be valid if anyOf the items match and invalid if they don't", async () => {
    let {getByTestId} = render(<DemoForm/>);
    await wait(() => getByTestId("lastName"));
    const buttonV = getByTestId("v");
    const valid  = getByTestId("valid");
    const errorContainer  = getByTestId("errors");

    const inputFN = getByTestId("firstName");
    const inputMN = getByTestId("middleName");
    const inputLN = getByTestId("lastName");
    const inputAKA = getByTestId("aka");
    fireEvent.change(inputFN, {target: {value: "Fred"}});
    fireEvent.change(inputMN, {target: {value: "Chico"}});
    fireEvent.change(inputLN, {target: {value: undefined}});
    fireEvent.change(inputAKA, {target: {value: undefined}});

    expect(valid.innerHTML).toBe('Unknown');
    fireEvent.click(buttonV);
    expect(valid.innerHTML).toBe('INVALID');
    expect(errorContainer.innerHTML).not.toBe('');
    expect(errorContainer.innerHTML).toContain('Please type a name which consists of words');

    const buttonLN = getByTestId("bln");
    fireEvent.click(buttonLN);
    expect(inputLN.value).toBe('Dirt');

    //Valid Test
    fireEvent.click(buttonV);
    expect(errorContainer.innerHTML).toBe('');
    expect(valid.innerHTML).toBe('VALID');
});
