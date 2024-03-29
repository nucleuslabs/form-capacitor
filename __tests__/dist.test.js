import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, cleanup, waitFor, screen} from "@testing-library/react";
import {useForm, useFormContext, useFormStatus, useField, useFieldErrors, useArrayField, observer} from "../dist";

function SimpleTextBox(props) {
    const [value, change] = useField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || undefined);
        }}/>
        <div data-testid={`${props.name}_errors`}>{hasErrors &&
        <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}</div>
    </span>;
}

function Alias(props) {
    const [alias] = useArrayField(props.name);
    return <ul data-testid={props.name}>
        {alias.map((obj, idx) => <li key={idx}>{obj.alias}</li>)}
    </ul>;
}


function Name(props) {
    const [name] = useField(props.name);
    return <div data-testid={`${props.name}Display`}>{name}</div>;
}

function StatusContainer() {
    const status = useFormStatus();
    return <div>
        <div data-testid="dirty">{status.isDirty && 'dirty'}</div>
        <div data-testid="changed">{status.isChanged && 'changed'}</div>
    </div>;
}

function DemoForm() {
    return useForm({
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
            alias: []
        },
        Loader: <div>Loading Nice Things...</div>,
        actions: formData => ({
            addAlias(alias) {
                formData.alias.push({alias});
            },
            clearAliases() {
                formData.alias.length = 0;
            },
            spliceAlias(idx) {
                formData.alias.splice(idx, 1);
            },
        }),
    }, observer(() => {
        const {stateTree: formData, reset, set} = useFormContext();
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
            <div>
                <span>Last Name</span>
                <SimpleTextBox data-testid="lastName" name="lastName"/>
            </div>
            <StatusContainer/>
            <Alias name={"alias"}/>
            <div data-testid="pepsi">{formData.firstName}</div>
            <div data-testid="coke">{formData.lastName}</div>
            <Name name={'lastName'}/>
            <Name name={'firstName'}/>
            <div>
                <button data-testid="bfn" onClick={() => set("firstName", "Joe")}>Set First Name</button>
                <button data-testid="bln" onClick={() => set("lastName", "Dirt")}>Set Last Name</button>
                <button data-testid="ba" onClick={() => set("alias", [{alias: 'Charlie'}, {alias: 'Roger'}])}>Set
                    Aliases
                </button>
                <button data-testid="ba2" onClick={() => formData.addAlias('Jack')}>Set Aliases</button>
                <button data-testid="breset" onClick={() => reset()}>Reset</button>
                <button data-testid="breplace" onClick={() => set({firstName: "Doge"})}>Replace</button>
            </div>
        </div>;
    }));
}

afterEach(cleanup);

test("Testing imports from dist files to make sure they perform the same as expected after being webpack'd.", async() => {
    let {getByTestId} = render(<DemoForm/>);

    await waitFor(() => getByTestId("lastName"));

    expect(getByTestId("dirty").innerHTML).toBe('');
    expect(getByTestId("changed").innerHTML).toBe('');
    expect(getByTestId("firstName").value).toBe('');

    fireEvent.click(getByTestId("bfn"));
    await waitFor(() => expect(screen.getByTestId('firstName').value).toBe('Joe'));     // React18/Mobx6 needs this wait after the first event for FC2 to get up to speed.
    expect(getByTestId("firstName").value).toBe('Joe');

    fireEvent.change(getByTestId("firstName"), {target: {value: ""}});

    expect(getByTestId("firstName_errors").childNodes.length).toBe(1);

    fireEvent.click(getByTestId("bfn"));

    expect(getByTestId("firstName").value).toBe('Joe');

    expect(getByTestId("dirty").innerHTML).toBe('dirty');
    expect(getByTestId("changed").innerHTML).toBe('changed');

    expect(getByTestId("firstNameDisplay").innerHTML).toBe('Joe');
    expect(getByTestId("pepsi").innerHTML).toBe('Joe');

    fireEvent.change(getByTestId("firstName"), {target: {value: ""}});

    expect(getByTestId("changed").innerHTML).toBe('');

    fireEvent.click(getByTestId("bfn"));

    expect(getByTestId("changed").innerHTML).toBe('changed');

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