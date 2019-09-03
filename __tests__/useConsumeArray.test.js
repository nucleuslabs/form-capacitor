import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import useSchema from "../src/useSchema";

import useConsumeArray from "../src/useConsumeArray";
import useConsumeErrors from "../src/useConsumeErrors";

function TextBoxArray({name}) {
    const [value, set, {push, remove, slice, clear, replace}] = useConsumeArray(name);
    const [hasErrors] = useConsumeErrors(name);

    const handleChange = idx => ev => {
        const lenDif = (value.length - 1) - idx;
        set(slice(0, idx).concat([{alias: ev.target.value}], lenDif > 0 ? slice(idx, lenDif) : []));
    };
    return <div>
        <div data-testid="alias">
            {value.map((inst, key) => <input key={key} type="text" className={hasErrors ? "error" : null} name={`${name}.${key}`} value={inst.alias || ""}
                                             onChange={handleChange(key)}/>)}
        </div>
        <button onClick={() => push({alias: "Joe"})}>+</button>
        <button onClick={() => value.length > 0 && remove(value[value.length - 1])}>-</button>
        <button onClick={() => value.length > 0 && remove(value[value.length - 1])}>--</button>
        <button onClick={() => clear()}>clear</button>
        <button onClick={() => replace([{alias: "NOT JOE"}])}>replace</button>
    </div>;
}

function DemoForm() {
    return useSchema(props => {
        const {ready} = props;
        if(!ready) {
            return <div>Loading...</div>;
        }
        return <div>
            Aliases: <TextBoxArray name="alias"/>
        </div>;
    }, {
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            firstName: "Foo",
            lastName: "Bar",
            alias: []
        }
    });
}

afterEach(cleanup);

test("Demo Form Should have buttons that use schema actions to make aliases called 'Joe' and other buttons with actions to remove them.", async () => {
    let {getByTestId, getByText} = render(<DemoForm/>);
    await wait(() => getByText("+"));
    let aliasUl = getByTestId("alias");
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].value).toBe('Joe');
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(2);
    expect(aliasUl.childNodes[1].value).toBe('Joe');
    fireEvent.click(getByText("-"));
    expect(aliasUl.childNodes.length).toBe(1);
    fireEvent.click(getByText("-"));
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    fireEvent.click(getByText("+"));
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(3);
    fireEvent.click(getByText("clear"));
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("replace"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].value).toBe('NOT JOE');
});