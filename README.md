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
| `wasSubmitted` | form was submitted |
| TODO: `wasValid`     | input was at some point valid |