import React from 'react';
import jsonSchema from './demo-form.json';
import {render, fireEvent, cleanup, waitFor, screen} from '@testing-library/react';
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
    return useForm({
        schema: jsonSchema,
        $ref: '#/definitions/DemoForm',
        default: {
            firstName: null,
            lastName: 'Bar',
            alias: []
        }
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

    await waitFor(() => getByTestId('lastName'));

    expect(getByTestId('firstName').value).toBe('');

    fireEvent.click(getByTestId('bfn'));

    await waitFor(() => expect(screen.getByTestId('firstName').value).toBe('Joe'));     // React18/Mobx6 needs this wait after the first event for FC2 to get up to speed.

    expect(getByTestId('firstName').value).toBe('Joe');

    fireEvent.change(getByTestId('firstName'), { target: { value: '' } });

    expect(getByTestId('firstName_errors').childNodes.length).toBe(1);

    fireEvent.click(getByTestId('bfn'));

    expect(getByTestId('firstName').value).toBe('Joe');

    fireEvent.change(getByTestId('firstName'), { target: { value: '' } });

    fireEvent.click(getByTestId('bfn'));


    const buttonLN = getByTestId('bln');
    fireEvent.click(buttonLN);
    expect(getByTestId('firstName').value).toBe('Joe');
    expect(getByTestId('lastName').value).toBe('Dirt');

    const buttonReplace = getByTestId('breplace');
    fireEvent.click(buttonReplace);
    expect(getByTestId('firstName').value).toBe('Doge');

    const buttonReset = getByTestId('breset');
    fireEvent.click(buttonReset);
    expect(getByTestId('lastName').value).toBe('Bar');

    fireEvent.change(getByTestId('firstName'), { target: { value: null } });
    expect(getByTestId('firstName').value).toBe('');
    fireEvent.change(getByTestId('firstName'), { target: { value: '0' } });
    expect(getByTestId('firstName').value).toBe('0');
    fireEvent.change(getByTestId('firstName'), { target: { value: '-1' } });
    expect(getByTestId('firstName').value).toBe('-1');
});