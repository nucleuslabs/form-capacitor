import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import useSchema from "../src/useSchema";
import useConsumeArray from "../src/useConsumeArray";
import useConsumeErrors from "../src/useConsumeErrors";
import useConsume from "../src/useConsume";
import {useObserver} from "mobx-react-lite";
import SubSchema from "../src/SubSchema";

function SimpleTextBox(props) {
    const [value, change] = useConsume(props.name);
    const [hasErrors, errors] = useConsumeErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || '');
        }}/>
        {hasErrors && <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}
    </span>;
}

function TextBoxContainer({name}) {
    return <SubSchema path={name}><SimpleTextBox data-testid={`alias${name}`} name={'alias'}/></SubSchema>;
}

function TextBoxArray({name}) {
    const [value, set, {push}] = useConsumeArray(name);

    return <SubSchema path={name}>
        <div>
            <div data-testid="alias">
                {value.map((inst, key) => <TextBoxContainer key={key} name={`${key}`}/>)}
            </div>
            <button onClick={() => push({alias: "Joe"})}>+</button>
        </div>
    </SubSchema>;
}

function DemoForm() {
    return useSchema(props => {
        const {ready} = props;
        if(!ready) {
            return <div>Loading...</div>;
        }
        return useObserver(() => <div>
            Aliases: <TextBoxArray name="alias"/>
        </div>);
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
    expect(getByTestId("alias").childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    expect(getByTestId("alias").childNodes.length).toBe(1);
    expect(getByTestId("alias0").value).toBe('Joe');
    fireEvent.click(getByText("+"));
    expect(getByTestId("alias").childNodes.length).toBe(2);
    fireEvent.change(getByTestId("alias0"), {target: {value: 'Kim'}});
    expect(getByTestId("alias0").value).toBe('Kim');
});