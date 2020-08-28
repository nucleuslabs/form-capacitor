import React from 'react';
import jsonSchema from './demo-form.json';
import { render, wait, cleanup } from '@testing-library/react';
import { observer } from 'mobx-react-lite';
import { useForm, useTextField, useFieldErrors} from '../src';
import useFormContext from '../src/useFormContext';

function SimpleTextBox (props) {
    const [value, change] = useTextField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? 'error' : null} value={value} onChange={ev => {
            change(ev.target.value);
        }}/>
        <div data-testid={`${props.name}_errors`}>{hasErrors &&
        <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}</div>
    </span>;
}

function DemoForm () {
    const fetchData = (new Promise((resolve) => {
        setTimeout(() => resolve({
            firstName: 'Porky',
            lastName: 'Bar',
            alias: []
        }), 50);
    }));
    return useForm({
        schema: jsonSchema,
        $ref: '#/definitions/DemoForm',
        default: fetchData.then(data => data),
    }, observer(() => {
        const { stateTree: formData, reset, set } = useFormContext();
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
            <div>
                <span>Last Name</span>
                <SimpleTextBox data-testid="lastName" name="lastName"/>
            </div>
            <div data-testid="pepsi">{formData.firstName}</div>
            <div data-testid="coke">{formData.lastName}</div>
            <div>
                <button data-testid="bfn" onClick={() => set('firstName', 'Joe')}>Set First Name</button>
                <button data-testid="bln" onClick={() => set('lastName', 'Dirt')}>Set Last Name</button>
                <button data-testid="ba" onClick={() => set('alias', [{ alias: 'Charlie' }, { alias: 'Roger' }])}>Set
                    Aliases
                </button>
                <button data-testid="ba2" onClick={() => formData.addAlias('Jack')}>Set Aliases</button>
                <button data-testid="breset" onClick={() => reset()}>Reset</button>
                <button data-testid="breplace" onClick={() => set({ firstName: 'Doge' })}>Replace</button>
            </div>
        </div>;
    }));
}

afterEach(cleanup);

test('The Set First Name button should set the first name to "Joe"', async () => {
    let { getByTestId } = render(<DemoForm/>);

    await wait(() => getByTestId('lastName'));

    expect(getByTestId('firstName').value).toBe('Porky');
    expect(getByTestId('lastName').value).toBe('Bar');
});