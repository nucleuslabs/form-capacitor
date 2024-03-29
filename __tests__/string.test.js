import jsonSchema from "./demo-form";
import {render, fireEvent, waitFor, screen, getByTestId} from "@testing-library/react";
import React, {useState} from "react";
import useField from "../src/useField";
import useFieldErrors from "../src/useFieldErrors";
import {observer} from "mobx-react-lite";
import {isObservable, toJS} from "mobx";
import {getFlattenedErrors} from "../src/errorMapping";
import {useForm, useFormContext} from "../src";

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

function DemoForm() {
    return useForm( {
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
            alias: [{}]
        }
    }, observer(() => {
        const [valid, setValid] = useState('Unknown');
        // const [errors, setErrors] = useState([]);
        const {validate, errorMap, formData} = useFormContext();

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
                <span>Last Name</span>
                <SimpleTextBox data-testid="lastName" name="lastName"/>
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
            <ul data-testid="errors">{errorMap && errorMap.size > 0 && getFlattenedErrors(errorMap).map((e, eIdx) => <li
                key={eIdx}>{e.path} : {e.message} : {JSON.stringify(toJS(formData))}</li>)}</ul>}</div>
        </div>;
    }));
}

//tests requiring mobx state tree
describe('When do defaults get validated?', function() {
    it('Should wait for an event on a specific field before applying validation errors/rules.', async function() {
        let {getByTestId} = render(<DemoForm/>);
        await waitFor(() => getByTestId("firstName"));

        expect(getByTestId("valid").innerHTML).toBe('Unknown');
        expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);
        expect(getByTestId("firstName").value).toBe('');
        expect(getByTestId("valid").innerHTML).toBe('Unknown');

        fireEvent.change(getByTestId("firstName"), {target: {value: "Frank"}});
        fireEvent.change(getByTestId("middleName"), {target: {value: "Lloyd"}});
        fireEvent.change(getByTestId("lastName"), {target: {value: "Wright"}});

        await waitFor(() => expect(screen.getByTestId('firstName').value).toBe('Frank'));           // React18/Mobx6 needs a burlier wait here.

        expect(getByTestId("firstName").value).toBe('Frank');
        expect(getByTestId("middleName").value).toBe('Lloyd');
        expect(getByTestId("lastName").value).toBe('Wright');
        expect(getByTestId("firstNameErrors").childNodes.length).toBe(0);
        expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

        fireEvent.change(getByTestId("firstName"), {target: {value: "Shambalashakazularifico"}});
        expect(getByTestId("firstName").value).toBe('Shambalashakazularifico');
        expect(getByTestId("firstNameErrors").childNodes.length).toBe(1);
        expect(getByTestId("errorMapContainer").childNodes.length).toBe(1);

        fireEvent.change(getByTestId("firstName"), {target: {value: "Zaboomafoo"}});
        expect(getByTestId("firstName").value).toBe('Zaboomafoo');
        expect(getByTestId("firstNameErrors").childNodes.length).toBe(0);
        // console.log(getByTestId("errorMapContainer").innerHTML);
        expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

        fireEvent.change(getByTestId("firstName"), {target: {value: "X"}});
        expect(getByTestId("firstName").value).toBe('X');
        expect(getByTestId("firstNameErrors").childNodes.length).toBe(1);
        expect(getByTestId("errorMapContainer").childNodes.length).toBe(1);

        fireEvent.change(getByTestId("firstName"), {target: {value: "Zaboomafoo"}});
        expect(getByTestId("firstName").value).toBe('Zaboomafoo');
        expect(getByTestId("firstNameErrors").childNodes.length).toBe(0);
        expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

        fireEvent.change(getByTestId("firstName"), {target: {value: "        "}});
        expect(getByTestId("firstNameErrors").childNodes.length).toBe(1);
        expect(getByTestId("errorMapContainer").childNodes.length).toBe(1);

        //@todo add validation for the format keyword including email, ip address, uri, dates/times and hostnames


    });
});