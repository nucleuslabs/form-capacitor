import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, cleanup, waitFor, screen} from "@testing-library/react";
import {observer} from "mobx-react-lite";
import {useForm, useMaterialUiField} from "../src";

function SimpleTextBox(props) {
    const {required, label, error, helperText, minLength, maxLength, min, max, value, onChange} = useMaterialUiField(props.name);

    return <span>
        <span data-testid={`${props.name}_label`}>{label}</span>
        <input type="text" {...props} className={error ? "error" : null} value={value || ""} onChange={onChange}/>
        <div data-testid={`${props.name}_errors`}>{error && helperText}</div>
        <div data-testid={`${props.name}_required`}>{required && 'true'}</div>
        <div data-testid={`${props.name}_minLength`}>{minLength}</div>
        <div data-testid={`${props.name}_maxLength`}>{maxLength}</div>
        <div data-testid={`${props.name}_min`}>{min}</div>
        <div data-testid={`${props.name}_max`}>{max}</div>
    </span>;
}

function DemoForm() {
    return useForm({
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            firstName: "Bar"
        },
        Loader: <div>Loading Nice Things...</div>,
    }, observer(() => {
        return <div>
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
        </div>;
    }));
}

afterEach(cleanup);

test("Testing material ui field hook full test of all props", async() => {
    let {getByTestId} = render(<DemoForm/>);

    await waitFor(() => getByTestId("firstName"));

    expect(getByTestId("firstName_label").innerHTML).toBe('First Name');
    expect(getByTestId("multiple_label").innerHTML).toBe('Multiple Types');
    expect(getByTestId("firstName").value).toBe('Bar');
    expect(getByTestId("firstName_required").innerHTML).toBe('true');
    expect(getByTestId("firstName_errors").childNodes.length).toBe(0);

    fireEvent.change(getByTestId("firstName"), {target: {value: ""}});
    await waitFor(() => expect(screen.getByTestId('firstName').value).toBe(''));     // React18/Mobx6 needs this wait after the first event for FC2 to get up to speed.

    expect(getByTestId("firstName_errors").childNodes.length).toBe(1);
    expect(getByTestId("firstName_errors").innerHTML).toBe("Please fill in the First Name field");

    fireEvent.change(getByTestId("firstName"), {target: {value: " "}});

    expect(getByTestId("firstName_errors").childNodes.length).toBe(2);
    expect(getByTestId("firstName_errors").innerHTML).toBe("First Name must have from 2 to 20 charactersFirst Name does not match the expected format");

    fireEvent.change(getByTestId("firstName"), {target: {value: "Cheese"}});

    expect(getByTestId("firstName").value).toBe('Cheese');
    expect(getByTestId("firstName_errors").childNodes.length).toBe(0);

    fireEvent.change(getByTestId("lastName"), {target: {value: "Gouda"}});

    expect(getByTestId("lastName").value).toBe('Gouda');

    expect(getByTestId("minLength_minLength").innerHTML).toBe("5");
    expect(getByTestId("maxLength_maxLength").innerHTML).toBe("5");
    expect(getByTestId("minmax_min").innerHTML).toBe("3");
    expect(getByTestId("minmax_max").innerHTML).toBe("3");
    expect(getByTestId("xminxmax_min").innerHTML).toBe("4");
    expect(getByTestId("xminxmax_max").innerHTML).toBe("4");

});