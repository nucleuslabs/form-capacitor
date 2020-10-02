import React from 'react';
import { render, wait, cleanup } from '@testing-library/react';
import FormError from "../src/FormError";

afterEach(cleanup);

test('The FormError Component should render', async () => {
    let { getByText } = render(<FormError message="Hello World"/>);
    await wait(() => getByText('Hello World'));
    expect(getByText('Hello World').innerHTML).toBe("Hello World");
});