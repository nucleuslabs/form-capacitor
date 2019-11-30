import useSchema from "../src/useSchema";
import jsonSchema from "./demo-form";
import {render, wait, cleanup} from "@testing-library/react";
import React, {useState} from "react";
import useConsume from "../src/useConsume";
import useConsumeErrors from "../src/useConsumeErrors";
import useConsumeArray from "../src/useConsumeArray";
import {useObserver} from "mobx-react-lite";
import {getFlattenedErrors} from "../src/errorMapping";

function SimpleTextBox(props) {
    const [value, change, {required}] = useConsume(props.name);
    const [hasErrors, errors] = useConsumeErrors(props.name);
    return <span>
        <span data-testid={`${props.name}_required`}>{required ? "*" : "?"}</span>  <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
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
            {valid !== 'Unknown' && <ul data-testid="errors">{errorMap && errorMap.size > 0 && getFlattenedErrors(errorMap).map((e, eIdx) => <li key={eIdx}>{e.message}</li>)}</ul>}
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
    await wait(() => getByTestId("firstName"));
    //Check Defaults
    expect(getByTestId("firstName_required").innerHTML).toBe('*');
    expect(getByTestId("middleName_required").innerHTML).toBe('*');
    expect(getByTestId("lastName_required").innerHTML).toBe('?');

});