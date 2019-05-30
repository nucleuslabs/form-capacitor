import {default as schema} from '../src/schema';
import {default as consumeValue} from '../src/consume';
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
                <div>
                    <span>Multiple Types</span>
                    <SimpleTextBox data-testid="multiple" name="multiple"/>
                </div>
            </div>
        );
    }
}

afterEach(cleanup);

test("Demo Form Should have Form-Capacitor backed firstName and LastName inputs and a list of aliases along with a button to add 'Joe' to the list and a button to remove an alias.", async () => {
    //render form
    const {getByTestId, getByText} = render(<DemoForm/>);

    //wait for inputs
    await wait(() => getByTestId("lastName"));

    //Test Last Name
    let inputL = getByTestId("lastName");
    expect(inputL.value).toBe('Bar');
    fireEvent.change(inputL, {target: {value: 'Baracus'}});
    expect(inputL.value).toBe('Baracus');

    //Test First Name
    const inputF = getByTestId("firstName");
    fireEvent.change(inputF, {target: {value: 'B.A.'}});
    expect(inputF.value).toBe('B.A.');
    fireEvent.change(inputF, {target: {value: ''}});
    expect(inputF.className).toBe('error');

    //Test Alias Array
    const aliasUl = getByTestId("alias");
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

    //Test Multiple types using anyOf
    let inputM = getByTestId("multiple");
    fireEvent.change(inputM, {target: {value: 'Found'}});
    expect(inputM.className).toBe('error');
    fireEvent.change(inputM, {target: {value: null}});
    expect(inputM.className).toBe('');
    fireEvent.change(inputM, {target: {value: 12}});
    expect(inputM.className).toBe('');
});
