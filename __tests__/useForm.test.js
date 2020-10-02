import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import {observer} from "mobx-react-lite";
import {useForm, useFormStatus, useField, useFieldErrors, useArrayField} from "../src";
import useFormContext from "../src/useFormContext";

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
                formData.alias.push({alias: alias});
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
                <button data-testid="toJSON" onClick={() => {
                    document.getElementById('json').innerHTML = formData.toJSON();
                }}>json</button>
            </div>
            <div id="json" data-testid="json"/>
        </div>;
    }));
}

function ErrorComponent ({message}) {
    return <div data-testid="err">{message}</div>;
}

function ActionsErrorForm () {
    return useForm({
        schema: {...jsonSchema},
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
            alias: []
        },
        Loader: <div>Loading Nice Things...</div>,
        actions: "big nope!",
        ErrorComponent: ErrorComponent
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
        </div>;
    }));
}

function TreeErrorForm () {
    return useForm({
        schema: {...jsonSchema},
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
            alias: []
        },
        treeSanitizer: "nope",
        ErrorComponent: ErrorComponent
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
        </div>;
    }));
}

function DefaultErrorForm(){
    return useForm({
        schema: {...jsonSchema},
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
            alias: []
        },
        defaultSanitizer: "nope",
        ErrorComponent: ErrorComponent
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
        </div>;
    }));
}

function ValidationErrorForm(){
    return useForm({
        schema: {...jsonSchema},
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
            alias: []
        },
        validationSanitizer: "nope",
        ErrorComponent: ErrorComponent
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
        </div>;
    }));
}

function OutputErrorForm(){
    return useForm({
        schema: {...jsonSchema},
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
            alias: []
        },
        outputSanitizer: "nope",
        ErrorComponent: ErrorComponent
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
        </div>;
    }));
}

afterEach(cleanup);

test("Test useForm standard use case.", async () => {
    let {getByTestId} = render(<DemoForm/>);

    await wait(() => getByTestId("lastName"));

    expect(getByTestId("dirty").innerHTML).toBe('');
    expect(getByTestId("changed").innerHTML).toBe('');
    expect(getByTestId("firstName").value).toBe('');

    fireEvent.click(getByTestId("bfn"));

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

    fireEvent.click(getByTestId("toJSON"));
    expect(getByTestId("json").innerHTML).toBe('{"lastName":"Bar"}');

});

test("Test actions option not a function error case.", async () => {
    const {getByTestId} = render(<ActionsErrorForm/>);
    await wait(() => getByTestId("err"));
    expect(getByTestId("err").innerHTML).toContain("options.actions must be a Function that takes in a mobx state tree and returns an object with a bunch of user defined methods (actions).");
});

test("Test treeSanitizer option not a function error case.", async () => {
    const {getByTestId} = render(<TreeErrorForm/>);
    await wait(() => getByTestId("err"));
    expect(getByTestId("err").innerHTML).toContain("options.treeSanitizer must be a Function that takes a single POJO Tree as the only parameter and returns a sanitized POJO.");
});

test("Test defaultSanitizer option not a function error case.", async () => {
    const {getByTestId} = render(<DefaultErrorForm/>);
    await wait(() => getByTestId("err"));
    expect(getByTestId("err").innerHTML).toContain("options.defaultSanitizer must be a Function that takes a single POJO Tree as the only parameter and returns a sanitized POJO.");
});

test("Test validationSanitizer option not a function error case.", async () => {
    const {getByTestId} = render(<ValidationErrorForm/>);
    await wait(() => getByTestId("err"));
    expect(getByTestId("err").innerHTML).toContain("options.validationSanitizer must be a Function that takes a single POJO Tree as the only parameter and returns a sanitized POJO.");
});

test("Test outputSanitizer option not a function error case.", async () => {
    const {getByTestId} = render(<OutputErrorForm/>);
    await wait(() => getByTestId("err"));
    expect(getByTestId("err").innerHTML).toContain("options.outputSanitizer must be a Function that takes a single POJO Tree as the only parameter and returns a sanitized POJO.");
});
