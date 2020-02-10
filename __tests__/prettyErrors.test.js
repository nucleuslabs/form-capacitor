import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import useSchema from "../src/useSchema";
import useField from "../src/useField";
import useFieldErrors from "../src/useFieldErrors";

import useArrayField from "../src/useArrayField";
import {useObserver} from "mobx-react-lite";
import SubSchema from "../src/SubSchema";
import {oneCharAtATime} from "../src/testHelper";

function SimpleTextBox(props) {
    const [value, change] = useField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            //isNan is in here to test numeric values with integer and number based type errors for numeric/string values
            change((!isNaN(ev.target.value) && ev.target.value ? ev.target.value * 1 : ev.target.value || undefined));
        }}/>
        <ul data-testid={`${props.name}_errors`}>{hasErrors && errors.map((err, eIdx) => <li
            key={eIdx}>{err.message}</li>)}</ul>
    </span>;
}

function TextBoxArray({dataTestId, name}) {
    const [value, {set, push, remove, slice, splice, replace}] = useArrayField(name);
    const [hasErrors, errors] = useFieldErrors(name);

    const handleChange = idx => ev => {
        splice(idx, 1, ev.target.value);
    };
    return <div>
        <div data-testid={`${dataTestId}_errors`} className={hasErrors ? "error" : null}>
            {value.map((inst, key) => <div key={key}><input
                type="text"
                data-testid={dataTestId}
                className={hasErrors ? "error" : null}
                name={`${name}.${key}`} value={inst || ""}
                onChange={handleChange(key)}/>
            </div>)}
            <ul>{hasErrors && errors.map((error, eIdx) => <li key={eIdx}>{error.message}</li>)}</ul>
        </div>
        <button data-testid={`${dataTestId}_add`} onClick={() => push("Cheese")}>+</button>
        <button
            data-testid={`${dataTestId}_remove`}
            onClick={() => value.length > 0 && remove(value[value.length - 1])}
        >-
        </button>
        <button onClick={() => value.length > 0 && set(slice(0, value.length - 1))}>--</button>
        <button data-testid={`${dataTestId}_kill`} onClick={() => set(undefined)}>clear</button>
        <button onClick={() => replace(["NOT CHEESE"])}>replace</button>
    </div>;
}

function AllOrNothing({name}) {
    return <SubSchema path={name}>
        <div>
            <span>Thing 1</span>
            <TextBoxArray dataTestId="aonthing1" name="aonthing1" buttonId="aonthing1"/>
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

function DeepAllOrNothing({name}) {
    const [items, {push}] = useArrayField(name);
    return <span><SubSchema path={name}>{items.map((item, itemIdx) => <DeepAllOrNothingItem key={itemIdx} name={itemIdx}/>)}</SubSchema><button
        data-testid="deepAllOrNothing_add" onClick={() => push({})}>add DAON</button></span>;
}

function DeepAllOrNothingItem({name}) {
    return <SubSchema path={name}>
        <div>
            <span>Thing 1</span>
            <TextBoxArray dataTestId={`daonthing1_${name}`} name="daonthing1"/>
        </div>
        <div>
            <span>Thing 2</span>
            <SimpleTextBox data-testid={`daonthing2_${name}`} errorTestId={`daonthing2_${name}_errors`} name="daonthing2"/>
        </div>
        <div>
            <span>Thing 3</span>
            <SimpleTextBox data-testid={`daonthing3_${name}`} errorTestId={`daonthing3_${name}_errors`} name="daonthing3"/>
        </div>
    </SubSchema>;
}


function DemoForm() {
    return useSchema(props => {
        const {ready, validate} = props;

        if(!ready) {
            return <div>Loading...</div>;
        }

        return useObserver(() => <div data-testid="form">
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
                <span>AKA</span>
                <SimpleTextBox data-testid="aka" name="aka"/>
            </div>
            <div>
                <span>Phone</span>
                <SimpleTextBox data-testid="phone" name="phone"/>
            </div>
            <div>
                <span>Min Characters</span>
                <SimpleTextBox data-testid="minLength" name="minLength"/>
            </div>
            <div>
                <span>Max Characters</span>
                <SimpleTextBox data-testid="maxLength" name="maxLength"/>
            </div>
            <div>
                <span>Age</span>
                <SimpleTextBox data-testid="age" name="age"/>
            </div>
            <div>
                <span>Height</span>
                <SimpleTextBox data-testid="height" name="height"/>
            </div>
            <div>
                <span>min</span>
                <SimpleTextBox data-testid="min" name="min"/>
            </div>
            <div>
                <span>max</span>
                <SimpleTextBox data-testid="max" name="max"/>
            </div>
            <div>
                <span>multiple types</span>
                <SimpleTextBox data-testid="multiple" name="multiple"/>
            </div>
            <div>
                <span>Nefarious Aliases</span>
                <TextBoxArray dataTestId="alias2" name="alias2" buttonId="alias2"/>
            </div>
            <AllOrNothing name="allOrNothing"/>
            <DeepAllOrNothing name="deepAllOrNothing"/>
            <div>
                <button data-testid="validate" onClick={() => validate()}>Validate</button>
            </div>
        </div>);
    }, {
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm"
    });
}

afterEach(cleanup);

test("We should have nice error things", async() => {
    let {getByTestId} = render(<DemoForm/>);

    await wait(() => getByTestId("lastName"));
    //anyOf
    fireEvent.change(getByTestId("lastName"), {target: {value: "what"}});
    fireEvent.change(getByTestId("lastName"), {target: {value: ""}});
    expect(getByTestId("lastName_errors").innerHTML).toContain('Please fill in either the AKA or Last Name field(s)');
    expect(getByTestId("aka_errors").innerHTML).toContain('Please fill in either the AKA or Last Name field(s)');
    //required
    fireEvent.change(getByTestId("middleName"), {target: {value: "what"}});
    fireEvent.change(getByTestId("middleName"), {target: {value: ""}});
    expect(getByTestId("middleName_errors").innerHTML).toContain('Please fill in the Middle Name field');
    //minMaxLength
    fireEvent.change(getByTestId("firstName"), {target: {value: "X"}});
    expect(getByTestId("firstName_errors").innerHTML).toContain('First Name must have from 2 to 20 characters');
    fireEvent.change(getByTestId("minLength"), {target: {value: "X"}});
    expect(getByTestId("minLength_errors").innerHTML).toContain('Min Characters must have at least 5 characters');
    fireEvent.change(getByTestId("maxLength"), {target: {value: "Franko Jones"}});
    expect(getByTestId("maxLength_errors").innerHTML).toContain('Max Characters must not have more than 5 characters');
    //pattern
    fireEvent.change(getByTestId("phone"), {target: {value: "fart"}});
    expect(getByTestId("phone_errors").innerHTML).toContain('Phone does not match the expected format');
    //minmax
    fireEvent.change(getByTestId("age"), {target: {value: 1}});
    expect(getByTestId("age_errors").innerHTML).toContain('Age must be a number from 3 to 5');
    fireEvent.change(getByTestId("age"), {target: {value: 10}});
    expect(getByTestId("age_errors").innerHTML).toContain('Age must be a number from 3 to 5');
    //min
    fireEvent.change(getByTestId("min"), {target: {value: 1}});
    expect(getByTestId("min_errors").innerHTML).toContain('Min must be 3 or more');
    //max
    fireEvent.change(getByTestId("max"), {target: {value: 100}});
    expect(getByTestId("max_errors").innerHTML).toContain('Max must be 10 or less');
    //exclusiveMax
    fireEvent.change(getByTestId("height"), {target: {value: 100}});
    expect(getByTestId("height_errors").innerHTML).toContain('Height must be greater than 2 to a maximum of 5');
    //maxItems
    for(let i = 0; i < 20; i++) {
        fireEvent.click(getByTestId("alias2_add"));
    }
    expect(getByTestId("alias2_errors").childNodes.length).toBeGreaterThan(8);
    expect(getByTestId("alias2_errors").innerHTML).toContain('Must have 8 or less Nefarious Aliases');
    //dependencies
    oneCharAtATime("Howdy Partner", (text) => {
        fireEvent.change(getByTestId("aonthing2"), {target: {value: text}});
        expect(getByTestId("aonthing1_errors").innerHTML).toContain("Please fill in the Thing 1 field. It is required when either Thing 2 or Thing 3 is set");
        expect(getByTestId("aonthing3_errors").innerHTML).toContain("Please fill in the Thing 3 field. It is required when either Thing 1 or Thing 2 is set");
    });
    // console.log(getByTestId("form").innerHTML);
});