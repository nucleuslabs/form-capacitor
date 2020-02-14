# form-capacitor - 

Form capacitor is a set of React Hooks that help you manage state, validation and errors for react based forms. 
This project makes use of mobx / mobx-state-tree for state management and AJV for validation.

Use json-schema to define the state and validation rules for your form then use a few simple Hooks to setup your form state management and validation.

**Project Status: Mostly Harmless**

The @latest version of this project now has reasonable test coverage using some complex form samples with react-testing-library and will soon be considered stable.

**Pros:**
1. It is Fast... - Form state is stored in observables so it's performance is not hindered by challenges such as having a large number of inputs and doing as you type validation on fields
2. Supports big complex forms and works well with repeatable dynamic input collections
3. Supports nth level nesting and grouping
4. Has pretty error messages
5. Using Json-schema allows you to validate the form in the browser and server using the same ruleset
6. The API is hooks based and the hooks for use with inputs work similar to `useState`
7. Easy to use with both super simple and super complex forms
8. Works well with popular UI components like react-select and react-date-picker and would pair nicely with material UI Components
9. Not too many dependencies mostly peerDependencies 

**Cons:**
1. Only supports [json-schema draft 7](https://json-schema.org/draft-07/json-schema-release-notes.html) no other versions are supported at this time the main reason for this is that as of this writing AJV doesn't support version 8
2. Does NOT support json-schema oneOf keyword (pull requests welcome)
3. Only supports React 16.8 or newer because it uses Hooks :(
4. One of the hook functions `useSchema` is actually Hook + HOC hybrid which may seem weird but it is because it uses a Context Provider so you don't need to wrap it yourself (this was an opinionated decision because we make a lot of forms and found the strange convenience of the the hook HOC combo to outweigh the standard pattern of wrapping things in Context Providers)
5. For complex state with deep tree structures you have to either specify the full path in the name of a Consumer Component which employs path separation using the '.' character i.e "demographicInfo.homeAddress.postalCode" for each input or wrap them in a `<SubScehma path={name}>` which will set the proper paths in context. (if you can think of a magical way to propagate paths without wrapping please submit a pull request)

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

## Hooks

Use this API for functional components

### `useSchema` Hook 

useSchema uses context to pass FormCapacitor props to your form component.

**params**
- FunctionalComponent
- options
  - schema: /path/to/some-json-schema-file.json `required`
  - $ref: "#/definitions/SimpleForm" `required`
  - default - The default data to hydrate the form state tree with `optional`
  - actions - A function that is passed the mobx state tree and attaches actions to it `optional`

}
**returns:**
{
 - ready - boolean - a boolean which is set to true once all promises have been resolved in the initialization process
 - formData - MST - a mobx-state-tree full of observable goodness that you can access all of your form state from the structure is based on your json schema. Import toJS() from mobx to see a snapshot of your form data tree.
 - formStatus - Observable object with properties that tell about the status of the form state.
 - set(path, value) - func - Used to set data within the MST for the supplied path.
 - set(object) - func - set is overloaded if you pass a POJO to it as the first parameter the whole state tree will be replaced
 - reset() - func -resets the mobx state tree to the initial state also resets the `formStatus.isDirty` and `formStatus.isChanged` to `false`
 - validate() - func - imperative validate function which returns true or false and also activates the error states and seeds the errorMap with errors for anything that is invalid 
 - hasErrors() - func - a function that tells whether or not there are any errors for this form   
 - ErrorMap - ObservableMap - a mobx observable map tree of all the errors
}

**formData Special Actions:**

- `formData.isChanged()` - Returns `true` if the current data is not the same as the original data.
- `formData.toJS()` - Returns a sanitized JS version of formData but with all empty arrays and undefined object properties removed. (if you want a non sanitized version mobx has a toJS method that return a full JS version of the state tree)
- `formData.toJSON()` - Returns a JSON string of formData that is produced using the same sanitization as the FormData.toJS method.

**formStatus:**
- `formStatus.isChanged` - boolean that is `true` if the formData is different then the when the defaults were set
- `formStatus.isDirty` - boolean that is `true` it doesn't care about the state of data only if the formData has been changed at any point.  

A basic form with 2 text inputs and a save button.
~~~
import jsonSchema from './SimpleForm.json';

function SimpleForm() {
    return useSchema(({set, ready, validate, formData, errorMap}) => {
        if(!ready) {
            return <div>Loading...</div>;
        }
        return useObserver(() => <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox name="firstName"/>
            </div>
            <div>
                <span>Last Name</span>
                <SimpleTextBox name="lastName"/>
            </div>
            <div>
                <button onClick={() => validate() ? console.log("Passed", formData.toJSON()) : console.error("Failed", formData.toJSON())}>Save</button>
            </div>
            {<ul>{errorMap && errorMap.size > 0 && errorMapToFlatArray(errorMap).map((e, eIdx) => <li key={eIdx}>{e.message}</li>)}</ul>}
        </div>)
    }, {
        schema: jsonSchema,
        $ref: "#/definitions/SimpleForm",
        default: {
            lastName: "Bar",
        },
    });
}
~~~


### `useConsume` Hook

Use within any control to get and set a value in the mobx state tree.

This hook functions similar to how the buitin `useState` hook works on call it passes back an array containing a getter and a setter.

The setter is a change function to set the state for that input in the mobx state tree.
 
The `path` argument is a string that corresponds to a path in the tree if it is a root input the name might be "phoneNumber" if it is a deeper value the name amy be "person.0.phoneNumber".


**args:**

path: path to observable in the state tree within the current context 

**returns:**

~~~
[
	value: {any}, //Observable value within the underlying mobx state tree
	change: func, //Setter function
    metaData: {required: boolean} //meta data currently only holds whether or not the field is required but will be expanded in the future
]
~~~

This example is a SimpleTextBox Component which is a basic wrapped html text input.

~~~
import React from "react";
import useConsume from "../src/useConsume";
import useConsumeErrors from "../src/useConsumeErrors";

function SimpleTextBox(props) {
    const [value, change] = useConsume(props.name);
    const [hasErrors, errors] = useConsumeErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || '');
        }}/>
        {hasErrors && <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}
    </span>;
}
~~~

### `useConsumeErrors` Hook

Use within any control to get the error state for the current path for an input control.

**args:**

path {string}: period delimited string path to observable in the state tree within the current context 

**returns:**

~~~
[
	hasErrors: {boolean}, //returns `true` if this field is invalid otherwise it returns false
	errors: [{path: [],message: string}],
]
~~~

This example is a SimpleTextBox Component which is a basic wrapped html text input.

~~~
import React from "react";
import useConsume from "../src/useConsume";
import useConsumeErrors from "../src/useConsumeErrors";

function SimpleTextBox(props) {
    const [value, change] = useConsume(props.name);
    const [hasErrors, errors] = useConsumeErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || '');
        }}/>
        {hasErrors && <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}
    </span>;
}
~~~



### `useConsumeArray` Hook

Use within any control and provide a handle change function to set the state for that input in the mobx state tree. The inputs are passed 
a name prop that defines what there path is in the tree. 

**args:**

path: path to observable in the state tree within the current context 

**returns:**

~~~
    const [value, set, {push, remove, slice, clear, replace}] = useConsumeArray(name);

[
	value: {any}, //Value for the supplied path within the tree which is usually prop.name
	set: {func}, //Setter function
	arrayMutators: {{
        push: {func(value)}, //Pushes `value` onto the end of the array
        remove: {func(value)}, //Removes elements from the array that match value 
        slice: {func(idx, length)}, //Slices `length` elements from the array starting at index `idx` 
        clear: {func}, //Removes all elements from the array by value 
        replace: {func}, //Replace what is within the array with new elements  
    }}
]
~~~

This example is a TextBoxArray Component which is an array of basic wrapped html text inputs.

~~~
import React from "react";
import useSchema from "../src/useSchema";
import useConsumeArray from "../src/useConsumeArray";
import useConsumeErrors from "../src/useConsumeErrors";


function TextBoxArray({name}) {
    const [value, set, {push, remove, slice, splice, clear, replace}] = useConsumeArray(name);
    const [hasErrors] = useConsumeErrors(name);

    const handleChange = idx => ev => {
        splice(idx, 1, {alias: ev.target.value});
    };
    return <div>
        <div data-testid="alias">
            {value.map((inst, key) => <input key={key} type="text" className={hasErrors ? "error" : null} name={`${name}.${key}`} value={inst.alias || ""}
                                             onChange={handleChange(key)}/>)}
        </div>
        <button onClick={() => push({alias: "Joe"})}>+</button>
        <button onClick={() => value.length > 0 && remove(value[value.length - 1])}>-</button>
        <button onClick={() => value.length > 0 && set(slice(0, value.length - 1))}>--</button>
        <button onClick={() => clear()}>clear</button>
        <button onClick={() => replace([{alias: "NOT JOE"}])}>replace</button>
    </div>;
}

~~~


### `SubSchema` Tag

This tag wraps its children in a context provider and sets the contextual path. The path will automatically be set for any child components for useConsume* hooks. You can use this component
for nesting inputs so that you don't have to prepend a path on each input. This Tag is designed to be used recursively so that wrap each level of your tree in this tag so that your inputs only need there local path in the the `name` attribute.

**attributes:**
path: path to append in the current context 


**json-schema (demo-form.json)**
~~~
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "definitions": {
    "DemoForm": {
      "title": "Demo Form",
      "description": "Basic Form to demo core features of FormCapacitor",
      "type": "object",
      "properties": {
        "firstName": {
          "errorMessage": "Please type a name which consists of words",
          "type": "string",
          "title": "First Name",
          "pattern": "\\w"
        },
        "middleName": {
          "type": "string",
          "title": "Middle Name",
          "pattern": "\\w"
        },
        "lastName": {
          "errorMessage": "Please type a name which consists of words",
          "type": "string",
          "title": "Last Name",
          "pattern": "\\w"
        },
        "aka": {
          "errorMessage": "Please type an AKA which consists of words",
          "type": "string",
          "title": "AKA",
          "pattern": "\\w"
        },
        "alias": {
          "type": "array",
          "title": "Aliases",
          "errorMessage": "Please type a made up name which consists of words",
          "items": {
            "type": "object",
            "title": "Alias",
            "properties": {
              "alias": {
                "type": "string"
              }
            }
          },
          "default": []
        },
        "alias2": {
          "type": "array",
          "title": "Aliases Part Deux",
          "errorMessage": "Please type a made up name which consists of words",
          "items": {
            "type": "string"
          },
          "default": []
        },
        "multiple": {
          "title": "Multiple Types",
          "anyOf": [
            {"type": "integer"},
            {"type": "null"}
          ]
        },
        "contacts": {
          "type": "array",
          "title": "Contacts",
          "description": "List of appointments that need to be booked",
          "items": {
            "$ref": "#/definitions/Contact"
          },
          "default": [
            {}
          ]
        }
      },
      "anyOf": [
        {
          "required": ["aka"],
          "errorMessage": " "
        },
        {"required": ["lastName"],
          "errorMessage": "Please enter a value in Either First Name or Last Name to save"
        }
      ],
      "required": [
        "firstName", "middleName"
      ]
    },
    "Contact": {
      "title": "Contact",
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string",
          "title": "First Name"
        },
        "lastName": {
          "type": "string",
          "title": "Last Name"
        },
        "phone": {
          "type": "integer",
          "title": "Phone #"
        }
      }
    }
  }
}
~~~

**React:**

~~~
import React from "react";
import jsonSchema from "./demo-form.json";
import {render, fireEvent, wait, cleanup} from "@testing-library/react";
import useSchema from "../src/useSchema";
import useConsumeArray from "../src/useConsumeArray";
import useConsumeErrors from "../src/useConsumeErrors";
import useConsume from "../src/useConsume";
import {useObserver} from "mobx-react-lite";
import SubSchema from "../src/SubSchema";

function SimpleTextBox(props) {
    const [value, change] = useConsume(props.name);
    const [hasErrors, errors] = useConsumeErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || '');
        }}/>
        {hasErrors && <ul>{errors.map((err, eIdx) => <li key={eIdx}>{err.message}</li>)}</ul>}
    </span>;
}

function TextBoxContainer({name}){
    return <SubSchema path={name}><SimpleTextBox name={'alias'}/></SubSchema>;
}

function TextBoxArray({name}) {
    const [value, set, {push, remove, slice, clear, replace}] = useConsumeArray(name);

    return <SubSchema path={name}>
               <div>
                   <div>
                       {value.map((inst, key) => <TextBoxContainer key={key} name={`${key}`}/>)}
                   </div>
                   <button onClick={() => push({alias: "Joe"})}>+</button>
               </div>
           </SubSchema>;
}

function DemoForm() {
    return useSchema(props => {
        const {ready} = props;
        if(!ready) {
            return <div>Loading...</div>;
        }
        return useObserver(() => <div>
            Aliases: <TextBoxArray name="alias"/>
        </div>);
    }, {
        schema: jsonSchema,
        $ref: "#/definitions/DemoForm",
        default: {
            firstName: "Foo",
            lastName: "Bar",
            alias: []
        }
    });
}
~~~

### FieldErrors 
A simple component for displaying errors in the example above. 
~~~
import * as React from "react";

export default function FieldErrors(props) {
    return <ul>{props.errors.map((err,key) => <li key={key}>{err.message}</li>)}</ul>
}
~~~
### Form Errors
a simple component that displays all of the errors for a form.
~~~
export default function FormErrors(props) {
    if(props.errors === undefined) {
        return null;
    } else {
        return <div>
            <div><b>Errors:</b></div>
            <div style={{backgroundColor: "#fff6d6"}}>
                <ul style={{padding: 4}}>
                {props.errors.filter(err => err.message.trim() !== "").map((err, key) => <li key={key} style={{color: "#db1818"}}>{err.title !== undefined && <b>{err.title} - </b>} {err.message}</li>)}
                </ul>
            </div>
        </div>
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

Run `make test` to run all the tests and see a coverage report.


### JSON Schema 'As You Type' validation todos:
- Support array type **Tuple Validation** (https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation)
