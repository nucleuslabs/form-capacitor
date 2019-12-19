import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import useSchema from "../src/useSchema";
import useConsume from "../src/useConsume";
import useConsumeErrors from "../src/useConsumeErrors";

import useConsumeArray from "../src/useConsumeArray";
import {useObserver} from "mobx-react-lite";

function SimpleTextBox(props) {
    const [value, change] = useConsume(props.name);
    const [hasErrors, errors] = useConsumeErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || '');
        }}/>
        {hasErrors && <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}
    </span>;
}

function Alias(props) {
    const [alias] = useConsumeArray(props.name);
    return <ul data-testid={props.name}>
        {alias.map((obj, idx) => <li key={idx}>{obj.alias}</li>)}
    </ul>;
}


function Name(props) {
    const [name] = useConsume(props.name);
    return <div data-testid={`${props.name}Display`}>{name}</div>;
}

function DemoForm() {
    return useSchema(props => {
        const {formData, set, reset, ready} = props;

        if(!ready) {
            return <div>Loading...</div>;
        }

        return useObserver(() => <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
            <div>
                <span>Last Name</span>
                <SimpleTextBox data-testid="lastName" name="lastName"/>
            </div>
            <Alias name={"alias"}/>
            <div data-testid="pepsi">{formData.firstName}</div>
            <div data-testid="coke">{formData.lastName}</div>
            <div data-testid="dirty">{formData.isDirty() && 'dirty'}</div>
            <div data-testid="changed">{formData.isChanged() && 'changed'}</div>
            <Name name={'lastName'}/>
            <Name name={'firstName'}/>
            <div>
                <button data-testid="bfn" onClick={() => set("firstName", "Joe")}>Set First Name</button>
                <button data-testid="bln" onClick={() => set("lastName", "Dirt")}>Set Last Name</button>
                <button data-testid="ba" onClick={() => set("alias", [{alias: 'Charlie'}, {alias: 'Roger'}])}>Set Aliases</button>
                <button data-testid="ba2" onClick={() => formData.addAlias('Jack')}>Set Aliases</button>
                <button data-testid="breset" onClick={() => reset()}>Reset</button>
                <button data-testid="breplace" onClick={() => set({firstName: "Doge"})}>Replace</button>
            </div>
        </div>);
    }, {
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
}

afterEach(cleanup);

test("The Set First Name button should set the first name to \"Joe\"", async () => {
    let {getByTestId} = render(<DemoForm/>);

    await wait(() => getByTestId("lastName"));

    expect(getByTestId("dirty").innerHTML).toBe('');
    expect(getByTestId("changed").innerHTML).toBe('');
    expect(getByTestId("firstName").value).toBe('');

    fireEvent.click(getByTestId("bfn"));

    expect(getByTestId("firstName").value).toBe('Joe');

    expect(getByTestId("dirty").innerHTML).toBe('dirty');
    expect(getByTestId("changed").innerHTML).toBe('changed');

    expect(getByTestId("firstNameDisplay").innerHTML).toBe('Joe');
    expect(getByTestId("pepsi").innerHTML).toBe('Joe');

    const buttonLN = getByTestId("bln");
    fireEvent.click(buttonLN);
    expect(getByTestId("firstName").value).toBe('Joe');
    const buttonA = getByTestId("ba");
    const buttonA2 = getByTestId("ba2");

    expect(getByTestId("lastName").value).toBe('Dirt');
    const aliasUl = getByTestId("alias");
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(buttonA);
    expect(aliasUl.childNodes.length).toBe(2);
    fireEvent.click(buttonA2);
    expect(aliasUl.childNodes.length).toBe(3);
    const buttonReplace = getByTestId("breplace");
    fireEvent.click(buttonReplace);
    expect(aliasUl.childNodes.length).toBe(0);

    expect(getByTestId("firstName").value).toBe('Doge');
    const buttonReset = getByTestId("breset");
    fireEvent.click(buttonReset);

    expect(getByTestId("lastName").value).toBe('Bar');


});