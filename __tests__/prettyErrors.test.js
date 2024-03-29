import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, cleanup, waitFor, screen} from "@testing-library/react";
import {observer} from "mobx-react-lite";
import {oneCharAtATime} from "./testHelper";
import {FormSubNode, useForm, useFormContext, useFieldErrors, useField, useArrayField} from "../src";

function SimpleTextBox(props) {
    const [value, change] = useField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            //isNan is in here to test numeric values with integer and number based type errors for numeric/string values
            change((!isNaN(ev.target.value) && ev.target.value ? ev.target.value * 1 : ev.target.value || undefined));
        }}/>
        <ul data-testid={`${props.name}_errors`}>{hasErrors && errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>
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
    return <FormSubNode path={name}>
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
    </FormSubNode>;
}

function DeepAllOrNothing({name}) {
    const [items, {push}] = useArrayField(name);
    return <span><FormSubNode path={name}>{items.map((item, itemIdx) => <DeepAllOrNothingItem key={itemIdx} name={itemIdx}/>)}</FormSubNode><button
        data-testid="deepAllOrNothing_add" onClick={() => push({})}>add DAON</button></span>;
}

function DeepAllOrNothingItem({name}) {
    return <FormSubNode path={name}>
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
    </FormSubNode>;
}

function DemoForm() {
    return useForm({
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm"
    }, observer(() => {
        const {validate, reset} = useFormContext();

        return <div data-testid="form">
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
                <span>xmin</span>
                <SimpleTextBox data-testid="xmin" name="xmin"/>
            </div>
            <div>
                <span>xmax</span>
                <SimpleTextBox data-testid="xmax" name="xmax"/>
            </div>
            <div>
                <span>min/max</span>
                <SimpleTextBox data-testid="minmax" name="minmax"/>
            </div>
            <div>
                <span>minXmax</span>
                <SimpleTextBox data-testid="minxmax" name="minxmax"/>
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
                <button data-testid="reset" onClick={() => reset()}>Reset</button>
                <button data-testid="reset2" onClick={() => reset(null, false)}>Reset 2</button>
            </div>
        </div>;
    }));
}

afterEach(cleanup);

test("We should have nice error things", async() => {
    let {getByTestId} = render(<DemoForm/>);

    await waitFor(() => getByTestId("lastName"));
    //anyOf
    fireEvent.change(getByTestId("lastName"), {target: {value: "what"}});
    await waitFor(() => expect(screen.getByTestId('lastName').value).toBe('what'));     // React18/Mobx6 needs this stronger wait here at the start.
    fireEvent.change(getByTestId("lastName"), {target: {value: ""}});
    await waitFor(() => expect(screen.getByTestId('lastName').value).toBe(''));         // React18/Mobx6 needs this stronger wait here at the start.
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
    //xmin
    fireEvent.change(getByTestId("xmin"), {target: {value: 2}});
    expect(getByTestId("xmin_errors").innerHTML).toContain('xMin must be more than 3');
    //xmax
    fireEvent.change(getByTestId("xmax"), {target: {value: 100}});
    expect(getByTestId("xmax_errors").innerHTML).toContain('xMax must be less than 10');
    //minmax are the same
    fireEvent.change(getByTestId("minmax"), {target: {value: 14}});
    expect(getByTestId("minmax_errors").innerHTML).toContain('Same Min Max must be 3');
    //minxmax
    fireEvent.change(getByTestId("minxmax"), {target: {value: 14}});
    expect(getByTestId("minxmax_errors").innerHTML).toContain('Min xMax must be 3 or more but less than 5');
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

    expect(getByTestId("lastName_errors").innerHTML).toContain('Please fill in either the AKA or Last Name field(s)');

    fireEvent.click(getByTestId('reset2'));

    expect(getByTestId("lastName_errors").innerHTML).toContain('Please fill in either the AKA or Last Name field(s)');

    fireEvent.click(getByTestId('reset'));

    expect(getByTestId("lastName_errors").innerHTML).not.toContain('Please fill in either the AKA or Last Name field(s)');

    // console.log(getByTestId("form").innerHTML);
});