import React from "react";
import {oneCharAtATime} from "./testHelper";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, cleanup, waitFor, screen} from "@testing-library/react";
import useField from "../src/useField";
import useFieldErrors from "../src/useFieldErrors";
import {observer} from "mobx-react-lite";
import {useForm} from "../src";

function SimpleTextBox(props) {
    const [value, change] = useField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : ''} value={value || ""} onChange={ev => {
            change(ev.target.value || '');
        }}/>
        {hasErrors && <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}
    </span>;
}

function DemoForm() {
    return useForm({
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
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
    }, observer(() => <div>
        <div>
            <span>First Name</span>
            <SimpleTextBox data-testid="firstName" name="firstName"/>
        </div>
        <div>
            <span>Last Name</span>
            <SimpleTextBox data-testid="middleName" name="middleName"/>
        </div>
    </div>
    ));
}

afterEach(cleanup);

test("The Set First Name button should set the first name to \"Joe\"", async () => {
    let {getByTestId} = render(<DemoForm/>);

    await waitFor(() => getByTestId("firstName"));

    oneCharAtATime("My Middle Name is Unknown", (text) => {
        fireEvent.change(getByTestId("middleName"), {target: {value: text}});
        expect(getByTestId("middleName").className).toBe('');
    });
    await waitFor(() => expect(screen.getByTestId('middleName').value).toBe('My Middle Name is Unknown'));       // React18/Mobx6 needs a burlier wait here.
    fireEvent.change(getByTestId("middleName"), {target: {value: ''}});
    expect(getByTestId("middleName").className).toBe('error');

    oneCharAtATime("My Middle Name is Unknown", (text) => {
        fireEvent.change(getByTestId("middleName"), {target: {value: text}});
        expect(getByTestId("middleName").className).toBe('');
    });

    fireEvent.change(getByTestId("middleName"), {target: {value: ''}});
    expect(getByTestId("middleName").className).toBe('error');

    oneCharAtATime("My Name is Anigo Montoya", (text) => {
        fireEvent.change(getByTestId("firstName"), {target: {value: text}});
        if(text.length > 1 && text.length < 21) {
            expect(getByTestId("firstName").className).toBe('');
        } else {
            expect(getByTestId("firstName").className).toBe('error');
        }
    });

    fireEvent.change(getByTestId("firstName"), {target: {value: ''}});
    expect(getByTestId("firstName").className).toBe('error');

    oneCharAtATime("CheeseHead", (text) => {
        fireEvent.change(getByTestId("firstName"), {target: {value: text}});
        if(text.length > 1 && text.length < 21) {
            expect(getByTestId("firstName").className).toBe('');
        } else {
            expect(getByTestId("firstName").className).toBe('error');
        }
    });

    fireEvent.change(getByTestId("firstName"), {target: {value: ''}});
    expect(getByTestId("firstName").className).toBe('error');
});