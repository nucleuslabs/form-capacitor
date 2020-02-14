import React from "react";
// import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import {FormSubNode, useForm, useField, useFieldErrors, useArrayField} from "../src";
import {observer} from "mobx-react-lite";

function SimpleTextBox(props) {
    const [value, change] = useField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || '');
        }}/>
        {hasErrors && <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}
    </span>;
}

function TextBoxContainer({name}) {
    return <FormSubNode path={name}><SimpleTextBox data-testid={`alias${name}`} name={'alias'}/></FormSubNode>;
}

function TextBoxArray({name}) {
    const [value, {push}] = useArrayField(name);

    return <FormSubNode path={name}>
        <div>
            <div data-testid="alias">
                {value.map((inst, key) => <TextBoxContainer key={key} name={`${key}`}/>)}
            </div>
            <button onClick={() => push({alias: "Joe"})}>+</button>
        </div>
    </FormSubNode>;
}

function DemoForm() {
    return useForm({
        schema: require('./demo-form.json'),
        $ref: "#/definitions/DemoForm",
        default: {
            firstName: "Foo",
            lastName: "Bar",
            alias: []
        }
    }, observer(() => <div>
        Aliases: <TextBoxArray name="alias"/>
    </div>));
}

afterEach(cleanup);

test("Demo Form Should have buttons that use schema actions to make aliases called 'Joe' and other buttons with actions to remove them.", async () => {
    let {getByTestId, getByText} = render(<DemoForm/>);
    await wait(() => getByText("+"));
    expect(getByTestId("alias").childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    expect(getByTestId("alias").childNodes.length).toBe(1);
    expect(getByTestId("alias0").value).toBe('Joe');
    fireEvent.click(getByText("+"));
    expect(getByTestId("alias").childNodes.length).toBe(2);
    fireEvent.click(getByText("+"));
    fireEvent.change(getByTestId("alias0"), {target: {value: 'Kim'}});
    expect(getByTestId("alias0").value).toBe('Kim');
    fireEvent.change(getByTestId("alias2"), {target: {value: 'Chi'}});
    expect(getByTestId("alias2").value).toBe('Chi');
    fireEvent.change(getByTestId("alias2"), {target: {value: ''}});
    expect(getByTestId("alias2").value).toBe('');
});