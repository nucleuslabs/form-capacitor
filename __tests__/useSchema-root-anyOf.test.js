import {errorMapToFlatArray} from "../src";
import React, {useState} from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import useSchema from "../src/useSchema";
import useConsume from "../src/useConsume";
import useConsumeErrors from "../src/useConsumeErrors";
import useConsumeArray from "../src/useConsumeArray";
import {useObserver} from "mobx-react-lite";


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

/**
 * @return {null|{}}
 */
function DemoForm() {
    return useSchema(props => {
        const [valid, setValid] = useState('Unknown');
        const [errs, setErrors] = useState([]);
        const {validate, set, ready, errorMap} = props;
        if(!ready) {
            return null;
        }
        return useObserver(() =>
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
                        })
                    }}>Set All The Things
                    </button>
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
                <div data-testid="errors">{errs.length > 0 && errs.map(e => e.message)}</div>
            </div>
        );
    }, {
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
    });
}

afterEach(cleanup);

test("The root anyOf keyword should be valid if anyOf the items match and invalid if they don't", async () => {
    let {getByTestId} = render(<DemoForm/>);
    await wait(() => getByTestId("lastName"));

    fireEvent.change(getByTestId("firstName"), {target: {value: "Fred"}});
    fireEvent.change(getByTestId("middleName"), {target: {value: "Chico"}});

    expect(getByTestId("valid").innerHTML).toBe('Unknown');
    fireEvent.click(getByTestId("v"));
    expect(getByTestId("valid").innerHTML).toBe('INVALID');
    expect(getByTestId("errors").childNodes.length).toBeGreaterThan(0);
    expect(getByTestId("errors").innerHTML).toContain('Please type a name which consists of words');

    fireEvent.change(getByTestId("lastName"), {target: {value: "Dirt"}});
    expect(getByTestId("lastName").value).toBe('Dirt');

    //Valid Test
    fireEvent.click(getByTestId("v"));
    expect(getByTestId("errors").innerHTML).toBe('');
    expect(getByTestId("valid").innerHTML).toBe('VALID');
});
