import React, {useState} from "react";
import jsonSchema from "./demo-form.json";
import anyOfArrayJsonSchema from "./anyOf-array-form";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import useSchema from "../src/useSchema";
import useConsume from "../src/useConsume";
import useConsumeErrors from "../src/useConsumeErrors";
import useConsumeArray from "../src/useConsumeArray";
import {useObserver} from "mobx-react-lite";
import {toJS} from "mobx";
import {getFlattenedErrors} from "../src/errorMapping";


function SimpleTextBox(props) {
    const [value, change] = useConsume(props.name);
    const [hasErrors, errors] = useConsumeErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value === '' ? undefined : ev.target.value);
        }}/>
        {hasErrors && <ul data-testid={`E-${props.name}`}>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}
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
        const {validate, set, ready, errorMap, formData} = props;
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
                            setErrors(getFlattenedErrors(errorMap));
                        }
                    }}>Validate
                    </button>
                </div>
                <div data-testid="valid">{valid}</div>
                <div data-testid="errors">{errs.length > 0 && errs.map(e => e.message)}</div>
                <div data-testid="errorMapContainer">{errorMap && errorMap.size > 0 && <ul data-testid="emap">{errorMap && errorMap.size > 0 && getFlattenedErrors(errorMap).map((e, eIdx) => <li key={eIdx}>{e.path} : {e.message} : {JSON.stringify(toJS(formData))}</li>)}</ul>}</div>
                <div data-testid="weird">{typeof formData.lastName}</div>
                <div data-testid="science">{formData.lastName}</div>
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






function TextBoxArray({name}) {
    const [value, set, {push, splice, clear}] = useConsumeArray(name);
    const [hasErrors] = useConsumeErrors(name);

    const handleChange = name === 'alias' ? idx => ev => {
        splice(idx, 1, {alias: ev.target.value});
    } : idx => ev => {
        splice(idx, 1, ev.target.value);
    };
    return <div>
        <div data-testid={`${name}_div`} className={hasErrors ? "error" : null}>
            {value.map((inst, key) => <input key={key} type="text" data-testid={`${name}_${key}`} name={`${name}.${key}`} value={name === 'alias' ? inst.alias || "" : inst || ""}
                                             onChange={handleChange(key)}/>)}
        </div>
        <button data-testid={`${name}_add1`} onClick={() => push({alias: "Big Joe"})}>+1</button>
        <button data-testid={`${name}_add2`} onClick={() => push("Little Joe")}>+2</button>
        <button data-testid={`${name}_clear`}  onClick={() => clear()}>clear</button>
    </div>;
}

function AnyOfArrayForm() {
    return useSchema(props => {
        const {ready} = props;
        if(!ready) {
            return null;
        }
        return useObserver(() =>
            <div>
                <div>
                    <span>Alias</span>
                    <TextBoxArray name="alias"/>
                </div>
                <div>
                    <span>Alias 2</span>
                    <TextBoxArray name="alias2"/>
                </div>
            </div>
        );
    }, {
        schema: anyOfArrayJsonSchema,
        $ref: "#/definitions/AnyOfArrayForm"
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
    await wait(() => getByTestId("E-lastName"));
    expect(getByTestId("E-lastName").childNodes.length).toBeGreaterThan(0);
    await wait(() => getByTestId("E-aka"));
    expect(getByTestId("E-aka").childNodes.length).toBeGreaterThan(0);
});


test("The root anyOf keyword should be valid for array elements if anyOf the items match and invalid if they don't", async () => {
    let {getByTestId} = render(<AnyOfArrayForm/>);
    await wait(() => getByTestId("alias_div"));

    fireEvent.click(getByTestId("alias_add1"));

    expect(getByTestId("alias_div").className).toBe("");
    expect(getByTestId("alias2_div").className).toBe("");

    fireEvent.click(getByTestId("alias_clear"));

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