import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import {observer} from "mobx-react-lite";
import {useForm, useMaterialUiArrayField} from "../src";

function SimpleTextBox(props) {
    //yeah I am totally cheating here to make sure the proper mui props come through even though in this case I really don't know if they should
    const {muiProps, value, set} = useMaterialUiArrayField(props.name);
    const {required, label, error, helperText, minLength, maxLength, min, max} = muiProps;

    const oC = (e) => set(e.target.value || undefined);
    return <span>
        <span data-testid={`${props.name}_label`}>{label}</span>
        <input type="text" {...props} className={error ? "error" : null} value={value || ""} onChange={oC}/>
        <div data-testid={`${props.name}_errors`}>{error && helperText}</div>
        <div data-testid={`${props.name}_required`}>{required && 'true'}</div>
        <div data-testid={`${props.name}_minLength`}>{minLength}</div>
        <div data-testid={`${props.name}_maxLength`}>{maxLength}</div>
        <div data-testid={`${props.name}_min`}>{min}</div>
        <div data-testid={`${props.name}_max`}>{max}</div>
    </span>;
}

function TextBoxArray({name}) {
    const {muiProps, value, set, push, pop, remove, splice, clear, replace} = useMaterialUiArrayField(name);
    const hasErrors = muiProps.error;

    const handleChange = idx => ev => {
        splice(idx, 1, {alias: ev.target.value});
    };
    return <div>
        <div data-testid="alias">
            {value.map((inst, key) => <input key={key} type="text" className={hasErrors ? "error" : null} name={`${name}.${key}`} value={inst.alias || ""} onChange={handleChange(key)}/>)}
        </div>
        <button onClick={() => push({alias: "Joe"})}>+</button>
        <button onClick={() => pop()}>---</button>
        <button onClick={() => value.length > 0 && remove(value[value.length - 1])}>-</button>
        <button onClick={() => value.length > 0 && set(value.slice(0, value.length - 1))}>--</button>
        <button onClick={() => clear()}>clear</button>
        <button onClick={() => replace([{alias: "NOT JOE"}])}>replace</button>
    </div>;
}

function TextBoxArray2({name}) {
    const {muiProps, value, splice} = useMaterialUiArrayField(name);
    const hasErrors = muiProps.error;

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
            firstName: "Bar",
            alias: []
        }
    }, observer(() => <div>
        <div>
            <SimpleTextBox data-testid="firstName" name="firstName"/>
        </div>
        <div>
            <SimpleTextBox data-testid="lastName" name="lastName"/>
        </div>
        <div>
            <SimpleTextBox data-testid="multiple" name="multiple"/>
        </div>
        <div>
            <SimpleTextBox data-testid="minLength" name="minLength"/>
        </div>
        <div>
            <SimpleTextBox data-testid="maxLength" name="maxLength"/>
        </div>
        <div>
            <SimpleTextBox data-testid="minmax" name="minmax"/>
        </div>
        <div>
            <SimpleTextBox data-testid="xminxmax" name="xminxmax"/>
        </div>
        Aliases: <TextBoxArray name="alias"/>
        Aliases 2: <TextBoxArray2 name="alias2"/>
    </div>));
}

afterEach(cleanup);

test("Testing advance material ui array field full test of {muiProps, value, set, push, remove, splice, clear, replace}", async() => {
    let {getByText, getByTestId} = render(<DemoForm/>);

    await wait(() => getByTestId("alias"));

    expect(getByTestId("minLength_minLength").innerHTML).toBe("5");
    expect(getByTestId("maxLength_maxLength").innerHTML).toBe("5");
    expect(getByTestId("minmax_min").innerHTML).toBe("3");
    expect(getByTestId("minmax_max").innerHTML).toBe("3");
    expect(getByTestId("xminxmax_min").innerHTML).toBe("4");
    expect(getByTestId("xminxmax_max").innerHTML).toBe("4");

    expect(getByTestId("alias").childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    expect(getByTestId("alias").childNodes.length).toBe(1);
    fireEvent.click(getByText("+"));
    expect(getByTestId("alias").childNodes.length).toBe(2);
    fireEvent.click(getByText("---"));
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