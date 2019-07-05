import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "react-testing-library";
import useSchema from "../src/useSchema";
import useConsume from "../src/useConsume";
import useConsumeErrors from "../src/useConsumeErrors";

import useConsumeArray from "../src/useConsumeArray";

function SimpleTextBox(props) {
    const [value, change] = useConsume(props.name);
    const [hasErrors, errors] = useConsumeErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || '');
        }}/>
        {hasErrors && <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}
    </span>
        ;
}

function Alias(props) {
    const [alias] = useConsumeArray(props.name);
    return <ul data-testid={props.name}>
        {alias.map((obj, idx) => <li key={idx}>{obj.alias}</li>)}
    </ul>;
}

function DemoForm() {
    const [SchemaProvider, context] = useSchema({
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
    });
    const {formData, set, reset, ready} = context;
    if(!ready) {
        return <div>Loading...</div>;
    }
    return <SchemaProvider>
        <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
            <div>
                <span>Last Name</span>
                <SimpleTextBox data-testid="lastName" name="lastName"/>
            </div>
            <Alias name={"alias"}/>
            <div>
                <button data-testid="bfn" onClick={() => set("firstName", "Joe")}>Set First Name</button>
                <button data-testid="bln" onClick={() => set("lastName", "Dirt")}>Set Last Name</button>
                <button data-testid="ba" onClick={() => set("alias", [{alias: 'Charlie'}, {alias: 'Roger'}])}>Set Aliases</button>
                <button data-testid="ba2" onClick={() => formData.addAlias('Jack')}>Set Aliases</button>
                <button data-testid="breset" onClick={() => reset()}>Reset</button>
                <button data-testid="breplace" onClick={() => set({firstName: "Doge"})}>Replace</button>
            </div>
        </div>
    </SchemaProvider>
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
    const buttonA2 = getByTestId("ba2");

    expect(inputLN.value).toBe('Dirt');
    const aliasUl = getByTestId("alias");
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(buttonA);
    expect(aliasUl.childNodes.length).toBe(2);
    fireEvent.click(buttonA2);
    expect(aliasUl.childNodes.length).toBe(3);
    const buttonReplace = getByTestId("breplace");
    fireEvent.click(buttonReplace);
    expect(aliasUl.childNodes.length).toBe(0);

    expect(inputFN.value).toBe('Doge');
    const buttonReset = getByTestId("breset");
    fireEvent.click(buttonReset);

    expect(inputLN.value).toBe('Bar');


});