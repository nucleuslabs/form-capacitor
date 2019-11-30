import useSchema from "../src/useSchema";
import jsonSchema from "./demo-form";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import React, {useState} from "react";
import useConsume from "../src/useConsume";
import useConsumeErrors from "../src/useConsumeErrors";
import useConsumeArray from "../src/useConsumeArray";
import {useObserver} from "mobx-react-lite";
import {getFlattenedErrors} from "../src/errorMapping";

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

function DemoForm() {
    return useSchema(props => {
        const [valid, setValid] = useState('Unknown');
        const {set, ready, validate, errorMap} = props;
        if(!ready) {
            return <div>Loading...</div>;
        }
        return useObserver(() => <div>
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
            <Alias name={"alias"}/>
            <div>
                <button data-testid="bfn" onClick={() => set("firstName", "Joe")}>Set First Name</button>
                <button data-testid="bln" onClick={() => set("lastName", "Dirt")}>Set Last Name</button>
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
            {valid !== 'Unknown' && <ul data-testid="errors">{errorMap && errorMap.size > 0 && getFlattenedErrors(errorMap).map((e, eIdx) => <li key={eIdx}>{e.title} - {e.message}</li>)}</ul>}
        </div>)
    }, {
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
            alias: [{}]
        },
    });
}

afterEach(cleanup);

test("The imperative schema validation function should behave itself", async () => {
    let {getByTestId} = render(<DemoForm/>);
    await wait(() => getByTestId("lastName"));

    //Check Defaults
    expect(getByTestId("firstName").value).toBe('');
    expect(getByTestId("valid").innerHTML).toBe('Unknown');

    //Invalid Test
    fireEvent.change(getByTestId("lastName"), {target: {value: undefined}});
    fireEvent.click(getByTestId("v"));
    expect(getByTestId("validated").innerHTML).toBe('INVALID');
    expect(getByTestId("errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("errors").childNodes[0].innerHTML).toContain('Please type a name which consists of words');
    fireEvent.change(getByTestId("firstName"), {target: {value: "Joe"}});
    fireEvent.change(getByTestId("lastName"), {target: {value: "Dirt"}});
    expect(getByTestId("firstName").value).toBe('Joe');
    expect(getByTestId("lastName").value).toBe('Dirt');

    //Middle Name test
    fireEvent.click(getByTestId("v"));
    expect(getByTestId("validated").innerHTML).toBe('INVALID');
    expect(getByTestId("errors").innerHTML).toContain('Middle Name');
    const aliasUl = getByTestId("alias");
    expect(aliasUl.childNodes.length).toBe(1);
    fireEvent.change(getByTestId("middleName"), {target: {value: 'Kim'}});

    //VALID Test
    fireEvent.click(getByTestId("v"));
    expect(getByTestId("errors").innerHTML).toBe('');
    expect(getByTestId("validated").innerHTML).toBe('VALID');
});