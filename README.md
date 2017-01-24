# form-capacitor

Form manager for [`react-redux`](https://github.com/reactjs/react-redux).


## UI States

| Term           | Description                        |
| -------------- | ---------------------------------- |
| `isDirty`      | value is different from initial state |
| `wasChanged`   | value was changed |
| `isEmpty`      | value is same as default value |
| `isFocused`    | input is focused |
| `wasFocused`   |  input was focused
| `wasBlurred`   | input lost focus |
| `isValid`      | input has no validation errors |
| `isHovering`   | mouse is over input |
| `mouseEntered` | mouse was over input |
| `mouseLeft`    | mouse entered input and then left |
| `formValidated` | form was validated (submit attempt) |
| TODO: `wasSubmitted` | form was validated while input was visible (rendered) |
| TODO: `wasValid`     | input was at some point valid |

## TODO

- `form.validate()` checks if all *rendered* inputs are valid. We should probably
add another property to check if *all* inputs, or at least select inputs are valid
- onSubmit validation rules
- async validation rules
- contingent validation rules