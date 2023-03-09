import React from "react";
import jsonSchema from "./allOf.json";
import {render, fireEvent, cleanup, waitFor} from "@testing-library/react";
import {observer} from "mobx-react-lite";
import {useField, useFieldErrors, useForm, useFormContext, useFormErrors} from "../src";

function SimpleTextBox(props) {
    const [value, set] = useField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);

    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => set(ev.target.value)} />
        <div data-testid={`${props.name}_errors`}>{hasErrors && errors.map(e => e.message)}</div>
    </span>;
}

function DemoForm() {
    return useForm({
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            aka: "Flerg"
        },
        Loader: <div>Loading Nice Things...</div>,
    }, observer(() => {
        const {validate} = useFormContext();
        const [hasErrors, errors] = useFormErrors();

        return <div>
            <ol data-testid="errors">{hasErrors && errors.map((e,eIdx) => <li key={eIdx}>{e.message}</li>)}</ol>
            <div>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
            <div>
                <SimpleTextBox data-testid="lastName" name="lastName"/>
            </div>
            <div>
                <SimpleTextBox data-testid="aka" name="aka"/>
            </div>
            <div>
                <SimpleTextBox data-testid="middleName" name="middleName"/>
            </div>
            <button data-testid="validate" onChange={()=>validate()}>validate</button>
        </div>;
    }));
}

afterEach(cleanup);

test("Testing material ui field hook full test of all props", async() => {
    let {getByTestId} = render(<DemoForm/>);

    await waitFor(() => getByTestId("firstName"));

    expect(getByTestId("firstName_errors").childNodes.length).toBe(0);
    fireEvent.change(getByTestId("aka"), {target: {value: ""}});
   // fireEvent.change(getByTestId("firstName"), {target: {value: undefined}});
   // fireEvent.change(getByTestId("lastName"), {target: {value: undefined}});
    console.log("Errors: ",getByTestId("errors").innerHTML)
    fireEvent.click(getByTestId("validate"));
    console.log("Errors: ",getByTestId("errors").innerHTML)

});