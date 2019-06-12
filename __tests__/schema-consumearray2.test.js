import * as React from "react";
import {consumeArrayValue} from "../src";
import {default as schema} from "../src/schema";
import jsonSchema from "./demo-form";
import {render, wait, fireEvent} from "react-testing-library";

@consumeArrayValue()
class TextBoxArray2 extends React.Component {
    handleChange = idx => ev => {
        const lenDif = (this.props.value.length - 1) - idx;
        this.props.fc.set(this.props.value.slice(0, idx).concat([{alias: ev.target.value}], lenDif > 0 ? this.props.value.slice(idx, lenDif) : []));
    };

    render() {
        const {fc, value, name, ...props} = this.props;
        return <div>
            <div data-testid="alias">
                {value.map((inst, key) => {
                    return <input key={key} type="text" {...props} className={fc.hasErrors ? "error" : null} name={`${name}.${key}`} value={inst || ""} onChange={this.handleChange(key)}/>;
                })}
            </div>
            <button onClick={() => fc.push("Joe")}>+</button>
            <button onClick={() => {
                try {
                    fc.push(22);
                } catch(err) {
                    if(err.message.includes('Error while converting `22` to `string`')) {
                        fc.push("Jordan");
                    }
                }
            }}>x
            </button>
            <button onClick={() => {
                try {
                    fc.push({alias: 'wut?'});
                } catch(err) {
                    if(err.message.includes('Error while converting `{"alias":"wut?"}` to `string`')) {
                        fc.push("Tyson");
                    }
                }
            }}>!
            </button>
            <button onClick={() => value.length > 0 && fc.remove(value[value.length - 1])}>-</button>
            <button onClick={() => fc.clear()}>clear</button>
            <button onClick={() => fc.replace(["NOT JOE"])}>replace</button>
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
class DemoForm2 extends React.Component {
    render() {
        if(!this.props.formData) {
            return null;
        }
        return (
            <div>
                <TextBoxArray2 name="alias2"/>
                <span data-testid="alexa">{this.props.formData.alias2.map(a2 => a2)}</span>
            </div>
        );
    }
}


//Very intense test of how form capacitor handles arrays of simple strings
test("Demo Form 2 Should have buttons that use schema actions to make aliases called 'Joe' and other buttons with actions to remove them.", async () => {
    let {getByTestId, getByText} = render(<DemoForm2/>);
    await wait(() => getByText("+"));
    let aliasUl = getByTestId("alias");
    expect(aliasUl.childNodes.length).toBe(0);
    fireEvent.click(getByText("+"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].value).toBe('Joe');
    fireEvent.click(getByText("+"));
    // console.log(aliasUl.childNodes[0]);
    expect(aliasUl.childNodes.length).toBe(2);
    expect(aliasUl.childNodes[0].value).toBe('Joe');
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

    //Lets make some errs!!!
    fireEvent.click(getByText("x"));
    expect(aliasUl.childNodes[1].value).toBe("Jordan");

    fireEvent.click(getByText("!"));
    expect(aliasUl.childNodes[2].value).toBe("Tyson");

    fireEvent.click(getByText("replace"));
    expect(aliasUl.childNodes.length).toBe(1);
    expect(aliasUl.childNodes[0].value).toBe('NOT JOE');
});