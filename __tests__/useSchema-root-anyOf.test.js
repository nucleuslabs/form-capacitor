import {errorMapToFlatArray} from "../src";
import React, {useState} from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "react-testing-library";
import useSchema from "../src/useSchema";
import useConsume from "../src/useConsume";
import useConsumeErrors from "../src/useConsumeErrors";


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

/**
 * @return {null|{}}
 */
function DemoForm() {
    const [valid, setValid] = useState('Unknown');
    const [errors, setErrors] = useState([]);

    const [SchemaProvider, context] = useSchema({
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
            alias: [{}]
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
        })
    });
    const {formData, validate, set, ready, errorMap} = context;
    if(!ready) {
        return null;
    }
    return (
        <SchemaProvider>
            <div>
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
                <ul data-testid="alias">
                    {formData.alias.map((obj, idx) => <li key={idx}>{obj.alias}</li>)}
                </ul>
                <div>
                    <button data-testid="bfn" onClick={() => set("firstName", "Joe")}>Set First Name</button>
                    <button data-testid="bln" onClick={() => set("lastName", "Dirt")}>Set Last Name</button>
                    <button data-testid="v" onClick={() => {
                        if(validate()) {
                            setValid("VALID");
                            setErrors([]);
                        } else {
                            setValid("INVALID");
                            setErrors(errorMapToFlatArray(errorMap));
                        }
                    }}>Validate
                    </button>
                </div>
                <div data-testid="valid">{valid}</div>
                <div data-testid="errors">{errors.length > 0 && errors.map(e => e.message)}</div>
            </div>
        </SchemaProvider>
    );
}

afterEach(cleanup);

test("The root anyOf keyword should be valid if anyOf the items match and invalid if they don't", async () => {
    let {getByTestId} = render(<DemoForm/>);
    await wait(() => getByTestId("lastName"));
    const buttonV = getByTestId("v");
    const valid = getByTestId("valid");
    const errorContainer = getByTestId("errors");

    const inputFN = getByTestId("firstName");
    const inputMN = getByTestId("middleName");
    const inputLN = getByTestId("lastName");
    const inputAKA = getByTestId("aka");
    fireEvent.change(inputFN, {target: {value: "Fred"}});
    fireEvent.change(inputMN, {target: {value: "Chico"}});
    fireEvent.change(inputLN, {target: {value: undefined}});
    fireEvent.change(inputAKA, {target: {value: undefined}});

    expect(valid.innerHTML).toBe('Unknown');
    fireEvent.click(buttonV);
    expect(valid.innerHTML).toBe('INVALID');
    expect(errorContainer.innerHTML).not.toBe('');
    expect(errorContainer.innerHTML).toContain('Please type a name which consists of words');

    const buttonLN = getByTestId("bln");
    fireEvent.click(buttonLN);
    expect(inputLN.value).toBe('Dirt');

    //Valid Test
    fireEvent.click(buttonV);
    expect(errorContainer.innerHTML).toBe('');
    expect(valid.innerHTML).toBe('VALID');
});
