import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import {observer} from "mobx-react-lite";
import {useForm, useMaterialUiField} from "../src";

function SimpleTextBox(props) {
    const {value, required, label, onChange, error: hasErrors, helperText} = useMaterialUiField(props.name);
    return <span>
        <span data-testid={`${props.name}_label`}>{label}</span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={onChange}/>
        <div data-testid={`${props.name}_errors`}>{hasErrors && helperText}</div>
        <div data-test-id={`${props.name}_required`}>{required && 'true'}</div>
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
        </div>;
    }));
}

afterEach(cleanup);

test("The Set First Name button should set the first name to \"Joe\"", async() => {
    let {getByTestId} = render(<DemoForm/>);

    await wait(() => getByTestId("firstName"));

    expect(getByTestId("firstName_label").innerHTML).toBe('First Name');

    expect(getByTestId("firstName").value).toBe('Bar');
    expect(getByTestId("firstName_errors").childNodes.length).toBe(0);

    fireEvent.change(getByTestId("firstName"), {target: {value: ""}});

    expect(getByTestId("firstName_errors").childNodes.length).toBe(1);
    expect(getByTestId("firstName_errors").innerHTML).toBe("Please fill in the First Name field");

    fireEvent.change(getByTestId("firstName"), {target: {value: " "}});

    expect(getByTestId("firstName_errors").childNodes.length).toBe(2);
    expect(getByTestId("firstName_errors").innerHTML).toBe("First Name must have from 2 to 20 charactersFirst Name does not match the expected format");

    fireEvent.change(getByTestId("firstName"), {target: {value: "Cheese"}});

    expect(getByTestId("firstName").value).toBe('Cheese');
    expect(getByTestId("firstName_errors").childNodes.length).toBe(0);
});