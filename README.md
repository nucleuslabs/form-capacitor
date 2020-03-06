# form-capacitor

Form capacitor is a set of React Hooks that help you manage state, validation and errors for react based forms. 
This project makes use of mobx / mobx-state-tree for state management and AJV for validation.

Use json-schema to define the state and validation rules for your form then use a few simple Hooks to setup your form state management and validation.

**Project Status: A few fun code reviews away from MVP**

The @latest version of this project now has reasonable test coverage using some complex form samples with react-testing-library and will soon be considered stable.

- [Installation](#installation)
- [Overview](./docs/intro.md)
- [API](./docs/api.md)
- [Examples](./docs/examples.md)
- [json-schema v7](https://json-schema.org/understanding-json-schema/basics.html)
- [mobx 4](https://mobx.js.org/README.html)

## Installation

*For form-capacitor `react 16.8` and `react-dom 16.8` are peer dependencies as hooks are required*

```text
yarn add react
yarn add react-dom
yarn add form-capacitor
```

## Usage

This is has changed considerably and I will be working on rewriting the docs soon.

### Helper methods
These are the core methods that are used to interact with the underlying mobx-state-tree. Also a function that can help formating error messages.  

 - getValue(obj, path) - gets a value in a mobx state tree or observable map tree based on a path array
 - setValue(obj, path, value) - sets a value in a mobx state tree or observable map tree based on a path array
 
### Error Map Methods

- getFlattenedErrors(ErrorMap, path = []) <- This method is useful. The others.. meh... not so much. 
- getErrors(ErrorMap, path = [])
- getErrorNode(ErrorMap, path = [])
- setError(ErrorMap, path = [], errorObj) 
- setErrors(ErrorMap, path = [], errorObj)

### json-schema Definition for your form
Create a definition file for your form including any validation rules.
~~~
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "definitions": {
    "SimpleForm": {
      "title": "Simple Form",
      "description": "Basic Form to test form-capacitor without a lot of external stuff",
      "type": "object",
      "properties": {
        "firstName": {
          "errorMessage": "Please type a name which consists of words",
          "type": "string",
          "title": "First Name",
          "pattern": "\\w",
          "required": [
            "firstName"
          ]
        },
        "lastName": {
          "errorMessage": "Please type a name which consists of words",
          "type": "string",
          "title": "Last Name",
          "pattern": "\\w"
        }
      },
      "required": [
        "firstName"
      ]
    }
  }
}
~~~

## State Management

Form-capacitor uses mobx 4 (for IE support) and a mobx-state-tree to manage 
form state. This style of observable based state management allows you to 
develop forms that only re-render input components where the state has changed for 
the inputs affected by the User interactions. The data for the form is pre
generated into a mobx state tree from the json-schema and then 

## Form definition using json-schema

The reason we chose json-schema to define each form is so that we could have 
the same validation standard for forms in the browser as the back end service 
which consumes the data.

## Validation

Validation can be As You Type or onEvent or Both it is up to you.  

### As You Type Validation

Ajv is used to validate data based on the underlying json-schema for the 
form. The schema is broken up into related elements so that re-renders for 
error-highlighting and field level error messages is somewhat smart during 
as you type validation... which you don't have to use The validation only
renders the error state for fields who's error state has changed due to 
a change in the underlying data which triggers a change in the validity 
of the field.

### onEvent Imperative Validation

The schema decorator passes a validation function as a prop to a form 
component decorated with the schema decorator that will fully 
validate the entire form data. This works nice if you want to roll your own
imperative validation on submit or change in focus or whatever.

### Errors

Errors can be managed at the consumer/input level via `useFieldErrors` 
or at the form provider level via the props.errorMap observable map tree. 
The`getFlattenedErrors` function included in form-capacitor will turn errorMap Tree 
into a flat array of error objects.    


## Testing
Run `make test` to run all the tests.

### some todos:
- Test json-schema array type **Tuple Validation** (https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation)
- Test json-schema `allOf` keyword
- L18N support for error messages 