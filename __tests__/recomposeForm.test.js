import * as React from "react";
import {render, fireEvent, waitFor as wait} from "@testing-library/react";
import {FormStoreProvider,connectForm, connectField, Rules, createReducer} from "../src";
import {compose} from 'recompose';
import {createStore, combineReducers} from 'redux';
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
            </div>
        );
    }
});


// afterEach(cleanup);

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
    fireEvent.change(getByTestId("firstName"), {target: {value: 'B.A.'}});
    expect(getByTestId("firstName").value).toBe('B.A.');
    expect(getByTestId("title").innerHTML).toBe("B.A. ");
    fireEvent.change(getByTestId("firstName"), {target: {value: ''}});
    expect(getByTestId("firstName").value).toBeEmpty();
    expect(getByTestId("firstName").className).toBe('error');
});

test("Demo Form Should have buttons that use schema actions to make aliases called 'Joe' and other buttons with actions to remove them.", async () => {
    let {getByTestId, getByText} = render(<DemoForm/>);
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
    expect(getByTestId("title").innerHTML).toBe("Joe Public");
    fireEvent.click(getByText("+"));
    expect(inputF.value).toBe("Joe");
    expect(inputL.value).toBe("Danger");
});