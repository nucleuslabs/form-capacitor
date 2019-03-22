import {default as schema} from '../src/schema';
import {consumeArrayValue} from '../src/consume';
import * as React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait} from "react-testing-library";

@consumeArrayValue()
class TextBoxArray extends React.Component {
    handleChange = idx => ev => {
        const lenDif = (this.props.value.length -1) - idx;
        this.props.fc.set(this.props.value.slice(0, idx).concat([{alias: ev.target.value}], lenDif > 0 ? this.props.value.slice(idx, lenDif): []));
    };

    render() {
        const {fc, value, name, ...props} = this.props;
        return <div>
            <div data-testid="alias">
            {value.map((inst, key) => <input key={key} type="text" {...props} className={fc.hasErrors ? "error" : null} name={`${name}.${key}`} value={inst.alias || ""} onChange={this.handleChange(key)}/>)}
            </div>
            <button onClick={() => fc.push({alias: "Joe"})}>+</button>
            <button onClick={() => value.length > 0 && fc.remove(value[value.length - 1])}>-</button>
            <button onClick={() => fc.clear()}>clear</button>
            <button onClick={() => fc.replace([{alias: "NOT JOE"}])}>replace</button>
        </div>;
    }
}

@schema({
    schema: jsonSchema,
    $ref: "#/definitions/DemoForm",
    default: {
        firstName: "Foo",
        lastName: "Bar",
        alias: []
    }
})
class DemoForm extends React.Component {
    render() {
        if(!this.props.formData) {
            return null;
        }
        return (
            <div>
                <TextBoxArray name="alias"/>
            </div>
        );
    }
}

// afterEach(cleanup);

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
