import * as React from "react";
import {render, fireEvent, wait} from "react-testing-library";
import {FormStoreProvider,connectForm, connectField, Rules, createReducer} from "../src";
import {compose} from 'recompose';
import { createStore, combineReducers } from 'redux';
import {Provider} from 'react-redux';
import {wrapDisplayName, setDisplayName} from 'recompose';
import namespace from '../src/namespace';


// const reducer = createReducer();
// console.log("Hi!");
// console.log(reducer);

const myStore = () =>  createStore(combineReducers({
    [namespace]: createReducer(),
}), window.__STATE__, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


const someStore = myStore();
console.log("Hi!");
console.log(someStore.getState());

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
        <Provider store={store}>
            <Component {...props} />
        </Provider>
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
        console.log(props.data);
        const {setField} = props;
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
                    <button onClick={() => setField("lastName", "Danger")}>+</button>
                    <button onClick={() => setField([], {firstName: "Joe", lastName: "Public"})}>-</button>
                </div>
            </div>
        );
    }
});


// afterEach(cleanup);

test("Demo Form Should have a lastName text input if we change it to \"Foo\" it should change", async () => {
    // console.log("Hi!");
    // console.log(store);

    let {getByTestId} = render(<FormStoreProvider><DemoForm/></FormStoreProvider>);
    await wait(() => getByTestId("firstName"));
    let input = getByTestId("firstName");
    expect(input.value).toBeEmpty();
    fireEvent.change(input, {target: {value: 'Foo'}});
    console.debug(someStore.getState());
    const state  = someStore.getState()[namespace][namespace];
    for (let stuff in state){
        console.debug(stuff, state[stuff]);
    }
    fireEvent.change(input, {target: {value: 'Bar'}});
    const state2  = someStore.getState()[namespace][namespace];
    for (let stuff in state2){
        console.debug(stuff, state2[stuff]);
    }
    expect(input.value).toBe('Foo');
});

test("Demo Form Should have a firstName text input that has a className of error if it is empty. ", async () => {
    let {getByTestId} = render(<FormStoreProvider><DemoForm/></FormStoreProvider>);
    await wait(() => getByTestId("firstName"));
    let input = getByTestId("firstName");
    fireEvent.change(input, {target: {value: 'B.A.'}});
    expect(input.value).toBe('B.A.');
    fireEvent.change(input, {target: {value: ''}});
    expect(input.className).toBe('error');
});

test("Demo Form Should have buttons that use schema actions to make aliases called 'Joe' and other buttons with actions to remove them.", async () => {
    let {getByTestId, getByText} = render(<FormStoreProvider><DemoForm/></FormStoreProvider>);
    await wait(() => getByTestId("firstName"));
    let inputF = getByTestId("firstName");
    let inputL = getByTestId("lastName");
    expect(inputF.value).toBeEmpty();
    fireEvent.change(inputF, {target: {value: 'Foo'}});
    expect(inputF.value).toBe('Foo');
    await wait(() => getByText("+"));
    await wait(() => getByText("-"));
    expect(inputL.value).toBeEmpty();
    fireEvent.click(getByText("+"));
    expect(inputL.value).toBe("Danger");
    fireEvent.click(getByText("-"));
    expect(inputF.value).toBe("Joe");
    expect(inputL.value).toBe("Public");
    fireEvent.click(getByText("+"));
    expect(inputF.value).toBe("Joe");
    expect(inputL.value).toBe("Danger");
});
