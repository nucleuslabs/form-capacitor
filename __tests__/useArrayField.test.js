import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, cleanup, waitFor, screen} from "@testing-library/react";
import {useForm, useFieldErrors, useArrayField} from "../src";
import {observer} from "mobx-react-lite";

function TextBoxArray({name}) {
    const [value, {set, push, remove, splice, clear, replace}] = useArrayField(name);
    const [hasErrors] = useFieldErrors(name);

    const handleChange = idx => ev => {
        splice(idx, 1, {alias: ev.target.value});
    };
    return <div>
        <div data-testid="alias">
            {value.map((inst, key) => <input key={key} type="text" className={hasErrors ? "error" : null} name={`${name}.${key}`} value={inst.alias || ""} onChange={handleChange(key)}/>)}
        </div>
        <button onClick={() => push({alias: "Joe"})}>+</button>
        <button onClick={() => value.length > 0 && remove(value[value.length - 1])}>-</button>
        <button onClick={() => value.length > 0 && set(value.slice(0, value.length - 1))}>--</button>
        <button onClick={() => clear()}>clear</button>
        <button onClick={() => replace([{alias: "NOT JOE"}])}>replace</button>
    </div>;
}

function TextBoxArray2({name}) {
    const [value, {splice}] = useArrayField(name);
    const [hasErrors] = useFieldErrors(name);

    const handleChange = idx => ev => {
        splice(idx, 1, ev.target.value);
    };
    return <div>
        <div data-testid="alias2">
            {value.map((inst, key) => <input key={key} type="text" className={hasErrors ? "error" : null} name={`${name}.${key}`} value={inst || ""} onChange={handleChange(key)}/>)}
        </div>
    </div>;
}

function DemoForm() {
    return useForm({
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            firstName: "Foo",
            lastName: "Bar",
            alias: []
        }
    }, observer(() => <div>
        Aliases: <TextBoxArray name="alias"/>
        Aliases 2: <TextBoxArray2 name="alias2"/>
    </div>));
}

afterEach(cleanup);

test("Demo Form Should have buttons that use schema actions to make aliases called 'Joe' and other buttons with actions to remove them.", async () => {
    let {getByTestId, getByText} = render(<DemoForm/>);
    await waitFor(() => getByText("+"));
    expect(getByTestId("alias").childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    await waitFor(() => expect(screen.getByTestId('alias').childNodes.length).toBe(1));       // React18/Mobx6 needs a burlier wait here.
    expect(getByTestId("alias").childNodes.length).toBe(1);
    expect(getByTestId("alias").childNodes[0].value).toBe('Joe');
    fireEvent.click(getByText("+"));
    expect(getByTestId("alias").childNodes.length).toBe(2);
    expect(getByTestId("alias").childNodes[1].value).toBe('Joe');
    fireEvent.click(getByText("--"));
    expect(getByTestId("alias").childNodes.length).toBe(1);
    fireEvent.click(getByText("-"));
    expect(getByTestId("alias").childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    fireEvent.click(getByText("+"));
    fireEvent.click(getByText("+"));
    expect(getByTestId("alias").childNodes.length).toBe(3);
    fireEvent.click(getByText("clear"));
    expect(getByTestId("alias").childNodes.length).toBe(0);
    fireEvent.click(getByText("replace"));
    expect(getByTestId("alias").childNodes.length).toBe(1);
    expect(getByTestId("alias").childNodes[0].value).toBe('NOT JOE');
    fireEvent.change(getByTestId("alias").childNodes[0], {target: {value: "Dirt"}});
    expect(getByTestId("alias").childNodes[0].value).toBe('Dirt');
});