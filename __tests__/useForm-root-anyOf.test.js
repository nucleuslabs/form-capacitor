import React, {useState} from "react";
import jsonSchema from "./demo-form.json";
import anyOfArrayJsonSchema from "./anyOf-array-form";
import {render, fireEvent, cleanup, waitFor, screen} from "@testing-library/react";
import useField from "../src/useField";
import useFieldErrors from "../src/useFieldErrors";
import useArrayField from "../src/useArrayField";
import {observer} from "mobx-react-lite";
import {toJS} from "mobx";
import useFormStateTree from "../src/useFormStateTree";
import useFormErrors from "../src/useFormErrors";
import {useForm, useFormActions} from "../src";


function SimpleTextBox(props) {
    const [value, change] = useField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value === '' ? undefined : ev.target.value);
        }}/>
        {hasErrors && <ul data-testid={`E-${props.name}`}>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}
    </span>;
}

function Alias(props) {
    const [alias] = useArrayField(props.name);
    return <ul data-testid={props.name}>
        {alias.map((obj, idx) => <li key={idx}>{obj.alias}</li>)}
    </ul>;
}

function DemoForm() {
    return useForm({
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
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
        })
    }, observer(() => {
        const [valid, setValid] = useState('Unknown');
        const formData = useFormStateTree();
        const [hasErrors, errors] = useFormErrors();
        const {validate, set} = useFormActions();
        return <div>
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
            <Alias name={'alias'}/>
            <div>
                <button data-testid="bfn" onClick={() => set("firstName", "Joe")}>Set First Name</button>
                <button data-testid="bln" onClick={() => set("lastName", "Dirt")}>Set Last Name</button>
                <button data-testid="fail" onClick={() => {
                    set({
                        firstName: "Fail",
                        middleName: "Sauce",
                        lastName: undefined,
                        aka: undefined
                    });
                }}>Set All The Things
                </button>
                <button data-testid="v" onClick={() => {
                    if(validate()) {
                        setValid("VALID");
                    } else {
                        setValid("INVALID");
                    }
                }}>Validate
                </button>
            </div>
            <div data-testid="valid">{valid}</div>
            <div data-testid="errors">{hasErrors && errors.map(e => e.message)}</div>
            <div data-testid="errorMapContainer">{hasErrors &&
            <ul data-testid="emap">{hasErrors && errors.map((e, eIdx) => <li
                key={eIdx}>{e.path} : {e.message} : {JSON.stringify(toJS(formData))}</li>)}</ul>}</div>
            <div data-testid="weird">{typeof formData.lastName}</div>
            <div data-testid="science">{formData.lastName}</div>
        </div>;
    }));
}

function TextBoxArray({name}) {
    const [value, {push, splice, clear}] = useArrayField(name);
    const [hasErrors] = useFieldErrors(name);

    const handleChange = name === 'alias' ? idx => ev => {
        splice(idx, 1, {alias: ev.target.value});
    } : idx => ev => {
        splice(idx, 1, ev.target.value);
    };
    return <div>
        <div data-testid={`${name}_div`} className={hasErrors ? "error" : null}>
            {value.map((inst, key) => <input key={key} type="text" data-testid={`${name}_${key}`} name={`${name}.${key}`} value={name === 'alias' ? inst.alias || "" : inst || ""} onChange={handleChange(key)}/>)}
        </div>
        <button data-testid={`${name}_add1`} onClick={() => push({alias: "Big Joe"})}>+1</button>
        <button data-testid={`${name}_add2`} onClick={() => push("Little Joe")}>+2</button>
        <button data-testid={`${name}_clear`} onClick={() => clear()}>clear</button>
    </div>;
}

function AnyOfArrayForm() {
    return useForm({
        schema: anyOfArrayJsonSchema,
        $ref: "#/definitions/AnyOfArrayForm"
    }, observer(() => {
        return <div>
            <div>
                <span>Alias</span>
                <TextBoxArray name="alias"/>
            </div>
            <div>
                <span>Alias 2</span>
                <TextBoxArray name="alias2"/>
            </div>
        </div>;
    }));
}


afterEach(cleanup);

test("The root anyOf keyword should be valid if anyOf the items match and invalid if they don't", async () => {
    let {getByTestId} = render(<DemoForm/>);
    await waitFor(() => getByTestId("lastName"));

    fireEvent.change(getByTestId("firstName"), {target: {value: "Fred"}});
    fireEvent.change(getByTestId("middleName"), {target: {value: "Chico"}});

    expect(getByTestId("valid").innerHTML).toBe('Unknown');
    fireEvent.click(getByTestId("v"));
    expect(getByTestId("valid").innerHTML).toBe('INVALID');
    expect(getByTestId("errors").childNodes.length).toBeGreaterThan(0);

    fireEvent.change(getByTestId("lastName"), {target: {value: "Dirt"}});
    expect(getByTestId("lastName").value).toBe('Dirt');

    //Valid Test
    fireEvent.click(getByTestId("v"));
    expect(getByTestId("errors").innerHTML).toBe('');
    expect(getByTestId("valid").innerHTML).toBe('VALID');

    //More anyOf Invalid Tests
    fireEvent.click(getByTestId("v"));
    fireEvent.change(getByTestId("aka"), {target: {value: ''}});
    fireEvent.change(getByTestId("lastName"), {target: {value: ''}});
    expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);
    await waitFor(() => getByTestId("E-lastName"));
    expect(getByTestId("E-lastName").childNodes.length).toBeGreaterThan(0);
    await waitFor(() => getByTestId("E-aka"));
    expect(getByTestId("E-aka").childNodes.length).toBeGreaterThan(0);
});


test("The root anyOf keyword should be valid for array elements if anyOf the items match and invalid if they don't", async () => {
    let {getByTestId} = render(<AnyOfArrayForm/>);
    await waitFor(() => getByTestId("alias_div"));

    fireEvent.click(getByTestId("alias_add1"));

    expect(getByTestId("alias_div").className).toBe("");
    expect(getByTestId("alias2_div").className).toBe("");

    fireEvent.click(getByTestId("alias_clear"));

    await waitFor(() => expect(screen.getByTestId('alias_div').className).toBe('error'));     // React18/Mobx6 needs this stronger wait
    expect(getByTestId("alias_div").className).toBe("error");
    expect(getByTestId("alias2_div").className).toBe("error");


    fireEvent.click(getByTestId("alias2_add2"));

    expect(getByTestId("alias_div").className).toBe("");
    expect(getByTestId("alias2_div").className).toBe("");

    fireEvent.click(getByTestId("alias_add1"));

    expect(getByTestId("alias_div").className).toBe("");
    expect(getByTestId("alias2_div").className).toBe("");

    fireEvent.click(getByTestId("alias2_clear"));

    expect(getByTestId("alias_div").className).toBe("");
    expect(getByTestId("alias2_div").className).toBe("");

    fireEvent.click(getByTestId("alias_clear"));

    expect(getByTestId("alias_div").className).toBe("error");
    expect(getByTestId("alias2_div").className).toBe("error");
});