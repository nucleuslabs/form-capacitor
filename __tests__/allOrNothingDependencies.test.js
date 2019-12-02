import React, {useState} from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import useSchema from "../src/useSchema";
import useConsume from "../src/useConsume";
import useConsumeErrors from "../src/useConsumeErrors";
import useConsumeArray from "../src/useConsumeArray";
import {useObserver} from "mobx-react-lite";
import SubSchema from "../src/SubSchema";
import {toJS} from "mobx";
import {getFlattenedErrors} from "../src/errorMapping";



function TextBoxArray({name}) {
    const [value, set, {push, remove, slice, splice, clear, replace}] = useConsumeArray(name);
    const [hasErrors] = useConsumeErrors(name);

    const handleChange = idx => ev => {
        splice(idx, 1, ev.target.value);
    };
    return <div>
        <div data-testid={name}>
            {value.map((inst, key) => <div key={key}><input type="text" className={hasErrors ? "error" : null} name={`${name}.${key}`} value={inst || ""}
                                                  onChange={handleChange(key)}/></div>)}
        </div>
        <button data-testid={`${name}_add`} onClick={() => push("Cheese")}>+</button>
        <button onClick={() => value.length > 0 && remove(value[value.length - 1])}>-</button>
        <button onClick={() => value.length > 0 && set(slice(0, value.length - 1))}>--</button>
        <button data-testid={`${name}_kill`} onClick={() => set(undefined)}>clear</button>
        <button onClick={() => replace(["NOT CHEESE"])}>replace</button>
    </div>;
}

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

function AllOrNothing ({name}){
    return <SubSchema path={name}>
        <div>
            <span>Thing 1</span>
            <TextBoxArray data-testid="aonthing1" name="aonthing1"/>
        </div>
        <div>
            <span>Thing 2</span>
            <SimpleTextBox data-testid="aonthing2" name="aonthing2"/>
        </div>
        <div>
            <span>Thing 3</span>
            <SimpleTextBox data-testid="aonthing3" name="aonthing3"/>
        </div>
    </SubSchema>;
}

function DemoForm() {
    return useSchema(props => {
        const {formData, validate, ready, errorMap} = props;
        const [valid, setValid] = useState('Unknown');
        if(!ready) {
            return <div>Loading...</div>;
        }

        return useObserver(() => <div>
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
            <div data-testid="errorMapContainer">{errorMap && errorMap.size > 0 && <ul data-testid="errors">{errorMap && errorMap.size > 0 && getFlattenedErrors(errorMap).map((e, eIdx) => <li key={eIdx}>{e.path.join("/")} : {e.message} : {JSON.stringify(toJS(formData))}</li>)}</ul>}</div>
        </div>);
    }, {
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            firstName: "Foo",
            middleName: "J",
            lastName: "Bar",
            alias: []
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
    });
}

afterEach(cleanup);

test("Test the base All or Nothing validation using dependencies keyword", async () => {
    let {getByTestId} = render(<DemoForm/>);

    await wait(() => getByTestId("aonthing1"));
    //Check to make sure everything is nothing
    expect(getByTestId("aonthing1").innerHTML).toBe('');
    expect(getByTestId("aonthing2").value).toBe('');
    expect(getByTestId("aonthing3").value).toBe('');

    expect(getByTestId("valid").innerHTML).toBe('Unknown');
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

    fireEvent.click(getByTestId("v"));

    expect(getByTestId("valid").innerHTML).toBe('VALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

    // fireEvent.change(getByTestId("aonthing2"), {target: {value: "Fart"}});

    fireEvent.click(getByTestId("aonthing1_add"));
    // fireEvent.change(getByTestId("aonthing1"), {target: {value: "Cheese"}});
    fireEvent.click(getByTestId("v"));

    expect(getByTestId("valid").innerHTML).toBe('INVALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);

    fireEvent.change(getByTestId("aonthing2"), {target: {value: "Fart"}});
    fireEvent.click(getByTestId("v"));

    expect(getByTestId("valid").innerHTML).toBe('INVALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBeGreaterThan(0);

    fireEvent.change(getByTestId("aonthing3"), {target: {value: "Time"}});
    // console.log(getByTestId("errorMapContainer").innerHTML);
     expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

    fireEvent.click(getByTestId("v"));
    expect(getByTestId("valid").innerHTML).toBe('VALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);

    fireEvent.click(getByTestId("v"));

    expect(getByTestId("valid").innerHTML).toBe('VALID');
    expect(getByTestId("errorMapContainer").childNodes.length).toBe(0);
});