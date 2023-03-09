import jsonSchema from "./array-form";
import {render, fireEvent, waitFor, screen} from "@testing-library/react";
import React, {useState} from "react";
import {observer} from "mobx-react-lite";
import {toJS} from "mobx";
import {getFlattenedErrors} from "../src/errorMapping";
import {
    useForm,
    useFormContext,
    useField,
    useFieldErrors,
    useArrayField,
    emptyStringNullSanitizer
} from "../src";

function SimpleTextBox(props) {
    const [value, change] = useField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || undefined);
        }}/>
        <span data-testid={`${props.name}Errors`}>{hasErrors && <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}</span>
    </span>;
}

function AliasString(props) {
    const [alias, {push, pop}] = useArrayField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <div>
        {alias.map((value, idx) => <SimpleTextBox key={idx} data-testid={`${props.name}_${idx}`} name={`${props.name}.${idx}`}/>)}
        <ul data-testid={`${props.name}_errors`}>{hasErrors && errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>
        <button onClick={() => push("Joe")}>+</button>
        <button onClick={() => pop()}>-</button>
    </div>;
}

function AliasObject(props) {
    const [alias, {push, pop}] = useArrayField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <div>
        {alias.map((value, idx) => <SimpleTextBox key={idx} data-testid={`${props.name}_${idx}`} name={`${props.name}.${idx}.alias`}/>)}
        <ul data-testid={`${props.name}_errors`}>{hasErrors && errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>
        <button onClick={() => push({alias: "Jane"})}>++</button>
        <button onClick={() => pop()}>--</button>
    </div>;
}

function AliasObject2(props) {
    const [alias, {push, pop}] = useArrayField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <div>
        {alias.map((value, idx) => {
            return <div key={idx}>
                <SimpleTextBox key={idx} data-testid={`${props.name}_${idx}`} name={`${props.name}.${idx}.alias`}/>
                <SimpleTextBox key={`${idx}_bread`} data-testid={`${props.name}_${idx}_bread`} name={`${props.name}.${idx}.bread`}/>
            </div>
        })}
        <ul data-testid={`${props.name}_errors`}>{hasErrors && errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>
        <button onClick={() => push({bread: "toast"})}>+++</button>
        <button onClick={() => pop()}>---</button>
    </div>;
}

function DemoForm() {
    return useForm({
        schema: jsonSchema,
        $ref: "#/definitions/ArrayForm",
        default: {
            alias: ['Frank']
        },
        validationSanitizer: emptyStringNullSanitizer
    }, observer(() => {
        const [valid, setValid] = useState('Unknown');
        // const [errors, setErrors] = useState([]);
        const {validate, errorMap, formData} = useFormContext();

        return <div data-testid={'form'}>
            <div>
                <span>Alias String:</span>
                <span><AliasString name="alias"/></span>
            </div>
            <div>
                <span>Alias Object:</span>
                <span><AliasObject name="alias2"/></span>
            </div>
            <div>
                <span>Array of Objects:</span>
                <span><AliasObject2 name="alias3"/></span>
            </div>
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
            {/*<div data-testid="errorContainer">{valid !== 'Unknown' && <ul data-testid="errors">{errors.length > 0 && errors.map((e, eIdx) => <li key={eIdx}>{e.message}</li>)}</ul>}</div>*/}
            <div data-testid="errorMapContainer">{errorMap && errorMap.size > 0 &&
            <ul data-testid="errors">{errorMap && errorMap.size > 0 && getFlattenedErrors(errorMap).map((e, eIdx) =>
                <li key={eIdx}>{e.path} : {e.message} : {JSON.stringify(toJS(formData))}</li>)}</ul>}</div>
        </div>;
    }));
}

//tests requiring mobx state tree
describe('When do defaults get validated?', function() {
    it('Should wait for an event on a specific field before applying validation errors/rules.', async function() {
        let {getByTestId, getByText} = render(<DemoForm/>);
        await waitFor(() => getByTestId("v"));

        expect(getByTestId("valid").innerHTML).toBe('Unknown');
        expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);
        expect(getByTestId("valid").innerHTML).toBe('Unknown');
        expect(getByTestId("alias_0").value).toBe('Frank');


        fireEvent.click(getByText("++"));

        expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);
        expect(getByTestId("alias_errors").childNodes.length).toBe(0);

        fireEvent.click(getByText("+"));
        await waitFor(() => expect(screen.getByTestId('alias_1').value).toBe('Joe'));       // React18/Mobx6 needs a burlier wait here.
        expect(getByTestId("alias_1").value).toBe('Joe');

        expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);
        expect(getByTestId("alias_errors").childNodes.length).toBeGreaterThan(0);

        fireEvent.click(getByText("+"));
        expect(getByTestId("alias_2").value).toBe('Joe');


        expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);
        expect(getByTestId("alias_errors").childNodes.length).toBeGreaterThan(0);

        fireEvent.click(getByText("-"));
        fireEvent.click(getByText("-"));
        fireEvent.click(getByText("++"));

        expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);
        expect(getByTestId("alias_errors").childNodes.length).toBe(0);
        //@todo add validation for the format keyword including email, ip address, uri, dates/times and hostnames
        fireEvent.click(getByText("++"));
        fireEvent.click(getByText("++"));

        expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);
        expect(getByTestId("alias2_errors").childNodes.length).toBeGreaterThan(0);


    });

    it('Should expect errors when schema "required" is not fulfilled', async () => {
        let {getByTestId, getByText} = render(<DemoForm/>);
        await waitFor(() => getByTestId("v"));

        fireEvent.click(getByTestId("v"));
        expect(getByTestId("valid").innerHTML).toBe('VALID');

        fireEvent.click(getByText("+++"));
        fireEvent.click(getByText("+++"));

        // errors on all required alias textboxes
        expect(getByTestId("alias3.0.aliasErrors").childNodes.length).toBe(1);
        expect(getByTestId("alias3.1.aliasErrors").childNodes.length).toBe(1);

        // but not on non-required bread textboxes
        expect(getByTestId("alias3.0.breadErrors").childNodes.length).toBe(0);
        expect(getByTestId("alias3.1.breadErrors").childNodes.length).toBe(0);

        // error should be pretty error
        expect(getByTestId("alias3.0.aliasErrors").innerHTML).toContain('Please fill in the alias field');
        expect(getByTestId("alias3.1.aliasErrors").innerHTML).toContain('Please fill in the alias field');

        fireEvent.click(getByTestId("v"));
        expect(getByTestId("valid").innerHTML).toBe('INVALID');

        // all errors should remain even after validating
        expect(getByTestId("errors").childNodes.length).toBe(2);
        expect(getByTestId("alias3.0.aliasErrors").childNodes.length).toBe(1);
        expect(getByTestId("alias3.1.aliasErrors").childNodes.length).toBe(1);
        expect(getByTestId("alias3.0.aliasErrors").innerHTML).toContain('Please fill in the alias field');
        expect(getByTestId("alias3.1.aliasErrors").innerHTML).toContain('Please fill in the alias field');

        // enter a value for all nodes to clear error
        fireEvent.change(getByTestId("alias3_0"), {target: {value: "Joe"}});
        expect(getByTestId("alias3_0").value).toBe('Joe');
        expect(getByTestId("alias3.0.aliasErrors").childNodes.length).toBe(0);

        fireEvent.change(getByTestId("alias3_1"), {target: {value: "Kim"}});
        expect(getByTestId("alias3_1").value).toBe('Kim');
        expect(getByTestId("alias3.1.aliasErrors").childNodes.length).toBe(0);

        fireEvent.click(getByTestId("v"));
        expect(getByTestId("valid").innerHTML).toBe('VALID');

        // emptying value should only produce pretty error on proper node that was cleared
        fireEvent.change(getByTestId("alias3_0"), {target: {value: ""}});
        expect(getByTestId("alias3_0").value).toBe('');

        expect(getByTestId("alias3.0.aliasErrors").childNodes.length).toBe(1);
        expect(getByTestId("alias3.0.aliasErrors").innerHTML).toContain('Please fill in the alias field');
        expect(getByTestId("alias3.1.aliasErrors").childNodes.length).toBe(0);

        fireEvent.click(getByTestId("v"));
        expect(getByTestId("valid").innerHTML).toBe('INVALID');

        fireEvent.change(getByTestId("alias3_1"), {target: {value: ""}});
        expect(getByTestId("alias3_1").value).toBe('');
        expect(getByTestId("alias3.1.aliasErrors").childNodes.length).toBe(1);
        expect(getByTestId("alias3.1.aliasErrors").innerHTML).toContain('Please fill in the alias field');

        fireEvent.click(getByTestId("v"));
        expect(getByTestId("valid").innerHTML).toBe('INVALID');

        fireEvent.change(getByTestId("alias3_0"), {target: {value: "Jake"}});
        expect(getByTestId("alias3_0").value).toBe('Jake');

        expect(getByTestId("alias3.0.aliasErrors").childNodes.length).toBe(0);
        expect(getByTestId("alias3.1.aliasErrors").childNodes.length).toBe(1);

        fireEvent.click(getByTestId("v"));
        expect(getByTestId("valid").innerHTML).toBe('INVALID');

        fireEvent.change(getByTestId("alias3_1"), {target: {value: "Batman"}});
        expect(getByTestId("alias3_1").value).toBe('Batman');
        expect(getByTestId("alias3.1.aliasErrors").childNodes.length).toBe(0);

        fireEvent.click(getByTestId("v"));
        expect(getByTestId("valid").innerHTML).toBe('VALID');
    });
});