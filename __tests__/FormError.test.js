import React from 'react';
import {render, cleanup, waitFor} from '@testing-library/react';
import FormError from "../src/FormError";

afterEach(cleanup);

test('The FormError Component should render', async () => {
    let { getByText } = render(<FormError message="Hello World"/>);
    await waitFor(() => getByText('Hello World'));
    expect(getByText('Hello World').innerHTML).toBe("Hello World");
});