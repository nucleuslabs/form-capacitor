import useSchema from "../src/useSchema";
import jsonSchema from "./array-form";
import {render, fireEvent, wait} from "@testing-library/react";
import React, {useState} from "react";
import useField from "../src/useField";
import useFieldErrors from "../src/useFieldErrors";
import useArrayField from "../src/useArrayField";
import {useObserver} from "mobx-react-lite";
import {toJS} from "mobx";
import {getFlattenedErrors} from "../src/errorMapping";

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

function DemoForm() {
    return useSchema(props => {
        const [valid, setValid] = useState('Unknown');
        // const [errors, setErrors] = useState([]);
        const {ready, validate, errorMap, formData} = props;
        if(!ready) {
            return <div>Loading...</div>;
        }

        return useObserver(() =>
            <div>
                <div>
                    <span>Alias String:</span>
                    <span><AliasString name="alias"/></span>
                </div>
                <div>
                    <span>Alias Object:</span>
                    <span><AliasObject name="alias2"/></span>
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
                <div data-testid="errorMapContainer">{errorMap && errorMap.size > 0 && <ul data-testid="errors">{errorMap && errorMap.size > 0 && getFlattenedErrors(errorMap).map((e, eIdx) => <li key={eIdx}>{e.path} : {e.message} : {JSON.stringify(toJS(formData))}</li>)}</ul>}</div>
            </div>
        );
    }, {
        schema: jsonSchema,
        $ref: "#/definitions/ArrayForm",
        default: {
            alias: ['Frank']
        }
    });
}

//tests requiring mobx state tree
describe('When do defaults get validated?', function() {
    it('Should wait for an event on a specific field before applying validation errors/rules.', async function() {
        let {getByTestId, getByText} = render(<DemoForm/>);
        await wait(() => getByTestId("v"));

        expect(getByTestId("valid").innerHTML).toBe('Unknown');
        expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);
        expect(getByTestId("valid").innerHTML).toBe('Unknown');
        expect(getByTestId("alias_0").value).toBe('Frank');


        fireEvent.click(getByText("++"));

        expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);
        expect(getByTestId("alias_errors").childNodes.length).toBe(0);

        fireEvent.click(getByText("+"));
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
});