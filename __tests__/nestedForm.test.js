import * as React from "react";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import {FormStoreProvider,connectForm, connectField, Rules, createReducer} from "../src";
import {compose} from 'recompose';
import { createStore, combineReducers } from 'redux';
import {wrapDisplayName, setDisplayName} from 'recompose';
import namespace from '../src/namespace';


// const reducer = createReducer();
// console.log("Hi!");
// console.log(reducer);

const myStore = () =>  createStore(combineReducers({
    [namespace]: createReducer(),
}), window.__STATE__, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


const someStore = myStore();

function createComponent({render, enhancers, displayName, propTypes,defaultProps}) {
    if(process.env.NODE_ENV !== 'production') {
        if(!displayName) {
            console.warn("Don't forget to add a `displayName` to `createComponent`");
        }

        Object.assign(render,{displayName,propTypes,defaultProps});
    }

    if(enhancers && enhancers.length) {
        if(enhancers.length > 1) {
            render = compose(...enhancers)(render);
        } else {
            render = enhancers[0](render);
        }
    }

    return render;
}

function provide(store) {
    return Component => setDisplayName(wrapDisplayName(Component, 'defaultProps'))(props => (
        <FormStoreProvider store={store}>
            <Component {...props} />
        </FormStoreProvider>
    ));
}

class StatelessSimpleTextBox extends React.Component {
    inputRef = n => {
        this.input = n;
        this.props.focusRef(n);
    };
    render() {
        const {value, name, events, errors} = this.props;
        return <input data-testid={this.props["data-testid"]} ref={this.inputRef} value={value === undefined ? '' : value} type="text" name={name} className={errors.length > 0 ? "error" : undefined} onChange = {events.onChange}/>;
    }
}

const SimpleTextBox = connectField()(StatelessSimpleTextBox);

// const PreDemoForm = connectForm({rules: {firstName: [Rules.required]}})(StatelessDemoForm);



class StatelessSubForm extends React.Component {
    render() {
        if(!this.props.data) {
            return null;
        }
        return (
            <div>
                <div>
                    <span>Colour</span>
                    <SimpleTextBox data-testid="colour" name="colour"/>
                </div>
                {/*<div>*/}
                {/*    <button onClick={() => setField("colour", "Blue")}>+</button>*/}
                {/*    <button onClick={() => setField([], {colour: "Red"})}>-</button>*/}
                {/*</div>*/}
            </div>
        );
    }
}

const SubForm = connectForm({rules: {colour: [Rules.required]}})(StatelessSubForm);

const DemoForm = createComponent({
    displayName: "DemoForm",
    enhancers:
        [
            provide(someStore),
            connectForm({rules: {firstName: [Rules.required]}}),
        ],
    render: props => {
        if(!props.data){
            return null;
        }
        const {setField} = props;
        return (
            <div>
                <div data-testid="title">{props.data.firstName || ''}{' '}{props.data.lastName || ''}</div>
                <div>
                    <span>First Name</span>
                    <SimpleTextBox data-testid="firstName" name="firstName"/>
                </div>
                <div>
                    <span>Last Name</span>
                    <SimpleTextBox data-testid="lastName" name="lastName"/>
                </div>
                <div>
                    <button onClick={() => setField("lastName", "Danger")}>+</button>
                    <button onClick={() => setField([], {firstName: "Joe", lastName: "Public"})}>-</button>
                </div>
                <FormStoreProvider><SubForm/></FormStoreProvider>
            </div>
        );
    }
});



afterEach(cleanup);

test("Demo Form Should have a lastName text input if we change it to \"Foo\" it should change", async () => {
    // console.log("Hi!");
    // console.log(store);

    let {getByTestId} = render(<DemoForm/>);
    await wait(() => getByTestId("firstName"));
    let input = getByTestId("firstName");
    expect(input.value).toBeEmpty();
    fireEvent.change(input, {target: {value: 'Foo'}});
    expect(input.value).toBe('Foo');
    expect(getByTestId("title").innerHTML).toBe("Foo ");
});

test("Demo Form Should have a firstName text input that has a className of error if it is empty. ", async () => {
    let {getByTestId} = render(<DemoForm/>);
    await wait(() => getByTestId("firstName"));
    let input = getByTestId("firstName");
    fireEvent.change(input, {target: {value: 'B.A.'}});
    expect(input.value).toBe('B.A.');
    expect(getByTestId("title").innerHTML).toBe("B.A. ");
    fireEvent.change(input, {target: {value: ''}});
    expect(input.value).toBeEmpty();
    expect(input.className).toBe('error');
});

test("Demo Form Should have buttons that use schema actions to make aliases called 'Joe' and other buttons with actions to remove them.", async () => {
    let {getByTestId, getAllByText} = render(<DemoForm/>);
    await wait(() => getByTestId("firstName"));
    let inputF = getByTestId("firstName");
    let inputL = getByTestId("lastName");
    expect(inputF.value).toBeEmpty();
    fireEvent.change(inputF, {target: {value: 'Foo'}});
    expect(inputF.value).toBe('Foo');
    await wait(() => getAllByText("+"));
    await wait(() => getAllByText("-"));
    expect(inputL.value).toBeEmpty();
    fireEvent.click(getAllByText("+")[0]);
    expect(inputL.value).toBe("Danger");
    fireEvent.click(getAllByText("-")[0]);
    expect(inputF.value).toBe("Joe");
    expect(inputL.value).toBe("Public");
    expect(getByTestId("title").innerHTML).toBe("Joe Public");
    fireEvent.click(getAllByText("+")[0]);
    expect(inputF.value).toBe("Joe");
    expect(inputL.value).toBe("Danger");
});


test("Demo Form Should have a colour input in a SubForm if we change it to \"Yellow\" and the n \"Green\" it should change also we should be able to change the lastName to \"Bee\" and see the result of that change.", async () => {
    // console.log("Hi!");
    // console.log(store);

    let {getByTestId} = render(<DemoForm/>);
    await wait(() => getByTestId("colour"));
    let input = getByTestId("colour");
    expect(input.value).toBeEmpty();
    fireEvent.change(input, {target: {value: 'Yellow'}});
    expect(input.value).toBe('Yellow');
    fireEvent.change(input, {target: {value: 'Green'}});
    expect(input.value).toBe('Green');
    let lnInput = getByTestId("lastName");
    expect(lnInput.value).toBeEmpty();
    fireEvent.change(lnInput, {target: {value: 'Bee'}});
    expect(lnInput.value).toBe('Bee');

});