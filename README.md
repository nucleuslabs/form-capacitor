# form-capacitor

Form manager for [`react-redux`](https://github.com/reactjs/react-redux).

![React](https://s3.amazonaws.com/uploads.hipchat.com/130443/945927/rP81ozgpaihR9mF/react50.png) ![Redux](https://s3.amazonaws.com/uploads.hipchat.com/130443/945927/XSrFE1EK3z71LYM/redux50.png) ![Capacitor](https://s3.amazonaws.com/uploads.hipchat.com/130443/945927/4Ujn4kIq6KP5ZES/flux50.png)

## UI States

| Term           | Description                        |
| -------------- | ---------------------------------- |
| `isDirty`      | value is different from initial state |
| `wasChanged`   | value was changed |
| `isEmpty`      | value is same as default value |
| `isFocused`    | input is focused |
| `wasFocused`   |  input was focused (visited) |
| `wasBlurred`   | input lost focus (touched) |
| `isValid`      | input has no validation errors |
| `isHovering`   | mouse is over input |
| `mouseEntered` | mouse was over input |
| `mouseLeft`    | mouse entered input and then left |
| `formValidated` | form was validated (submit attempt) |
| TODO: `wasSubmitted` | form was validated while input was visible (rendered) |
| TODO: `wasValid`     | input was at some point valid |

See also: [redux-form meta props](http://redux-form.com/6.4.3/docs/api/Field.md/#usage)

## TODO

- contingent validation rules
- `form.validate()` checks if all *rendered* inputs are valid. We should probably
add another property to check if *all* inputs, or at least select inputs are valid
- onSubmit validation rules
- async validation rules + ui states
- [`<FormSection>`](http://redux-form.com/6.4.3/docs/api/FormSection.md/)
- [`format` and `parse`](http://redux-form.com/6.4.3/docs/ValueLifecycle.md/)
- warnings
- `setFocus`
- `destroy` (delete state) and `reset` form (revert to initial values, clear UI state)
- More features from React-Redux...

### Naming

- `validate` or `rules`?