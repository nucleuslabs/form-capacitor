# form-capacitor

Form manager for [`react-redux`](https://github.com/reactjs/react-redux).

![](https://s3.amazonaws.com/uploads.hipchat.com/130443/945927/rP81ozgpaihR9mF/react50.png) ![](https://s3.amazonaws.com/uploads.hipchat.com/130443/945927/XSrFE1EK3z71LYM/redux50.png) ![](https://s3.amazonaws.com/uploads.hipchat.com/130443/945927/4Ujn4kIq6KP5ZES/flux50.png)

Makes managing form state easy!

## Raison D'être

Mostly I didn't like this API provided by [Redux Form](http://redux-form.com/6.4.3/docs/api/Field.md/):

```jsx
<Field name="myField" component={MyCustomInput}/>
```

I think this muddles the properties meant for the validator vs those for UI component. For example, in Form Capacitor, every `Field` has a name which is used in the state tree, but this is different from `name` attribute passed to `<input>` or any other underlying component. Basically, I wanted a clear separation of concerns.

Also, perhaps more importantly, we need a centralized "rules" object which lays out the validation rules for all the fields in one place so that we could serialize these rules from the server -- trying to thread them through to each field individually would be tedious, and having a singular validate function which validates all the fields is both inelegant and hard to serialize.

Lastly, it needed to be easy to validate fields that don't exist yet. For this, we have a special `*` syntax...

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