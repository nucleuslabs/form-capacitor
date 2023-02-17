import React, {useState} from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, cleanup, waitFor} from "@testing-library/react";
import {observer} from "mobx-react-lite";
import {toJS} from "mobx";
import {getFlattenedErrors} from "../src/errorMapping";
import {FormSubNode, useForm, useFormContext, useFieldErrors, useArrayField, useField} from "../src";

function SimpleTextBox(props) {
    const [value, change] = useField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || '');
        }}/>
        {hasErrors && <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}
    </span>;
}

function Alias(props) {
    const [alias] = useArrayField(props.name);
    return <ul data-testid={props.name}>
        {alias.map((obj, idx) => <li key={idx}>{obj.alias}</li>)}
    </ul>;
}

function AllOrNothing ({name}){
    return <FormSubNode path={name}>
        <div>
            <span>Thing 1</span>
            <SimpleTextBox data-testid="aonthing1" name="aonthing1"/>
        </div>
        <div>
            <span>Thing 2</span>
            <SimpleTextBox data-testid="aonthing2" name="aonthing2"/>
        </div>
        <div>
            <span>Thing 3</span>
            <SimpleTextBox data-testid="aonthing3" name="aonthing3"/>
        </div>
    </FormSubNode>;
}

function DemoForm() {
    return useForm({
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            firstName: "Foo",
            middleName: "J",
            lastName: "Bar"
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
    }, observer(() => {
        const {stateTree: formData, validate, status, errorMap} = useFormContext();
        const [valid, setValid] = useState('Unknown');

        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
            <div>
                <span>Last Name</span>
                <SimpleTextBox data-testid="lastName" name="lastName"/>
            </div>
            <Alias name={"alias"}/>
            <AllOrNothing name="allOrNothing"/>
            <div>
                <span>Other</span>
                <SimpleTextBox data-testid="dep1" name="dep1"/>
            </div>
            <div>
                <span>If Other is set I should be Required</span>
                <SimpleTextBox data-testid="dep2" name="dep2"/>
            </div>
            <div data-testid="pepsi">{formData.firstName}</div>
            <div data-testid="coke">{formData.lastName}</div>
            <div>
                <button data-testid="v" onClick={() => {
                    if(validate()) {
                        setValid("VALID");
                        // setErrors([]);
                    } else {
                        setValid("INVALID");
                        // setErrors(errorMapToFlatArray(errorMap));
                    }
                }}>Validate
                </button>
            </div>
            {valid !== 'Unknown' && <div data-testid="validated">{valid}</div>}
            <div data-testid="valid">{valid}</div>
            <div data-testid="errorMapContainer">{status.hasErrors && <ul data-testid="errors">{getFlattenedErrors(errorMap).map((e, eIdx) => <li key={eIdx}>{e.path.join("/")} : {e.message} : {JSON.stringify(toJS(formData))}</li>)}</ul>}</div>
        </div>;
    }));
}

afterEach(cleanup);

test("Test basic root level dependencies keyword", async () => {
    let {getByTestId} = render(<DemoForm/>);

    await waitFor(() => getByTestId("dep1"));
    //Check to make sure everything is nothing
    expect(getByTestId("dep1").value).toBe('');
    expect(getByTestId("dep2").value).toBe('');
    expect(getByTestId("valid").innerHTML).toBe('Unknown');
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

    fireEvent.click(getByTestId("v"));
    expect(getByTestId("valid").innerHTML).toBe('VALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

    fireEvent.change(getByTestId("dep1"), {target: {value: "Cheese"}});
    expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);

    fireEvent.click(getByTestId("v"));
    expect(getByTestId("valid").innerHTML).toBe('INVALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);

    fireEvent.change(getByTestId("dep2"), {target: {value: "Fart"}});
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

    fireEvent.click(getByTestId("v"));
    expect(getByTestId("valid").innerHTML).toBe('VALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);
});

