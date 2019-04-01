import * as React from "react";
import {render, fireEvent, wait} from "react-testing-library";
import {FormStoreProvider,connectForm, connectField} from "../src";


class StatelessSimpleTextBox extends React.Component {
    inputRef = n => {
        this.input = n;
        this.props.focusRef(n);
    };
    render() {
        const {value, name, events} = this.props;
        return <input data-testid={this.props["data-testid"]} ref={this.inputRef} value={value === undefined ? '' : value} type="text" name={name} onChange = {events.onChange}/>;
    }
}

const SimpleTextBox = connectField()(StatelessSimpleTextBox);

class StatelessDemoForm extends React.Component {
    render() {
        if(!this.props.data){
            return null;
        }
        const {data} = this.props;
        return (
            <div>
                <div>
                    <span>First Name</span>
                    <SimpleTextBox data-testid="firstName" name="firstName"/>
                </div>
                <div>
                    <span>Last Name</span>
                    <SimpleTextBox data-testid="lastName" name="lastName"/>
                </div>
                <div>
                    <button onClick={() => data.setField("lastName", "Danger")}>+</button>
                    <button onClick={() => data.setField([], {firstName: "Joe", lastName: "Public"})}>-</button>
                </div>
            </div>
        );
    }
}

const DemoForm = connectForm({})(StatelessDemoForm);


// afterEach(cleanup);

test("Demo Form Should have a lastName text input if we change it to \"Foo\" it should change", async () => {
    let {getByTestId} = render(<FormStoreProvider><DemoForm/></FormStoreProvider>);
    await wait(() => getByTestId("firstName"));
    let input = getByTestId("firstName");
    expect(input.value).toBeEmpty();
    fireEvent.change(input, {target: {value: 'Foo'}});
    expect(input.value).toBe('Foo');
});

// test("Demo Form Should have a firstName text input that has a className of error if it is empty. ", async () => {
//     let {getByTestId} = render(<DemoForm/>);
//     await wait(() => getByTestId("firstName"));
//     let input = getByTestId("firstName");
//     fireEvent.change(input, {target: {value: 'B.A.'}});
//     expect(input.value).toBe('B.A.');
//     fireEvent.change(input, {target: {value: ''}});
//     expect(input.className).toBe('error');
// });

// test("Demo Form Should have buttons that use schema actions to make aliases called 'Joe' and other buttons with actions to remove them.", async () => {
//     let {getByTestId, getByText} = render(<DemoForm/>);
//     await wait(() => getByText("+"));
//     let aliasUl = getByTestId("alias");
//     expect(aliasUl.childNodes.length).toBe(0);
//     fireEvent.click(getByText("+"));
//     expect(aliasUl.childNodes.length).toBe(1);
//     expect(aliasUl.childNodes[0].textContent).toBe('Joe');
//     fireEvent.click(getByText("+"));
//     expect(aliasUl.childNodes.length).toBe(2);
//     expect(aliasUl.childNodes[1].textContent).toBe('Joe');
//     fireEvent.click(getByText("-"));
//     expect(aliasUl.childNodes.length).toBe(1);
//     fireEvent.click(getByText("-"));
//     expect(aliasUl.childNodes.length).toBe(0);
// });
