# form-capacitor - 

**!!!Highly Experimental Project!!!**

Form manager for [`react`](https://github.com/facebook/react) that makes 
use of mobx for state and ajv for validation.


Form capacitor is a set of Higher Order Components that help you manage the 
state, validation and errors for react forms that are defined using json-schema. 


With form-capacitor you can use 1 json-schema and 2 or 3 decorators to setup your 
form state management and validation.  

## Usage

### Helper methods
These are the core methods that are used to interact with the underlying mobx-state-tree. Also a function that can help formating error messages.  

 - getValue(obj, path) - gets a value in a mobx state tree or observable map tree based on a path array
 - setValue(obj, path, value) - sets a value in a mobx state tree or observable map tree based on a path array
 - errorMapToFlatArray(errorMap) - converts an observable array errorMap to a flat array of error objects

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
 - FormData - MST - a mobx-state-tree full of observable goodness that you can access all of your form state from the structure is based on your json schema. Import toJS() from mobx to see a snapshot of your form data tree.
 - set(path, value) - func - Used to set data within the MST for the supplied path.
 - set(object) - func - set is overloaded if you pass a POJO to it as the first parameter the whole state tree will be replaced
 - reset() - func -resets the mobx state tree to the initial state
 - validate() - func - imperative validate function which returns true or false and also activates the error states and seeds the errorMap with errors for anything that is invalid 
 - ErrorMap - ObservableMap - a mobx observable map tree 
}


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
                <button onClick={() => validate() ? console.log("Passed", formData) : console.error("Failed", formData)}>Save</button>
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

path: path to observable in the state tree within the current context 

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

This example is a TextBoxArray Component which is a bunch of basic wrapped html text input.

~~~
import React from "react";
import useSchema from "../src/useSchema";
import useConsumeArray from "../src/useConsumeArray";
import useConsumeErrors from "../src/useConsumeErrors";

function TextBoxArray({name}) {
    const [value, set, {push, remove, slice, clear, replace}] = useConsumeArray(name);
    const [hasErrors] = useConsumeErrors(name);

    const handleChange = idx => ev => {
        const lenDif = (value.length - 1) - idx;
        set(slice(0, idx).concat([{alias: ev.target.value}], lenDif > 0 ? slice(idx, lenDif) : []));
    };
    return <div>
        <div data-testid="alias">
            {value.map((inst, key) => <input key={key} type="text" className={hasErrors ? "error" : null} name={`${name}.${key}`} value={inst.alias || ""}
                                             onChange={handleChange(key)}/>)}
        </div>
        <button onClick={() => push({alias: "Joe"})}>+</button>
        <button onClick={() => value.length > 0 && remove(value[value.length - 1])}>-</button>
        <button onClick={() => clear()}>clear</button>
        <button onClick={() => replace([{alias: "NOT JOE"}])}>replace</button>
    </div>;
}

~~~


### `useSchemaPath` Hook

This hook works much like useSchema in that it wraps `component` in context 
and then passes `compoonent` back so that any children of the component that 
use the useConsume hooks will have the desired context path. You can use this component
for nesting complex or inputs 

**args:**
component: Component that you want to wrap so that the context path gets updated 
path: path to append in the current context 

**returns:**

~~~
[
	<FunctionalComponent/> wrapped in context
]
~~~

This example is a SimpleTextBox Component which is a basic wrapped html text input.


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
import useSchemaPath from "../src/useSchemaPath";

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
    return useSchemaPath(props => <SimpleTextBox name={'alias'}/>, name);
}

function TextBoxArray({name}) {
    const [value, set, {push, remove, slice, clear, replace}] = useConsumeArray(name);

    return useSchemaPath(props => <div>
            <div>
                {value.map((inst, key) => <TextBoxContainer key={key} name={`${key}`}/>)}
            </div>
            <button onClick={() => push({alias: "Joe"})}>+</button>
       </div>, name);
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


#Decorators

Use this API for HOC's and classes.

### `@schema` decorator 

The schema decorator wraps the form in a HOC with context provider that feeds 
FormCapacitor props to your form component.

**Required Settings**
- schema: /path/to/some-json-schema-file.json,
- $ref: "#/definitions/FormX",

**Optional Settings**
- default - The default data to hydrate the form state tree with
- actions - A function that is passed the mobx state tree and attaches actions to it

**props:**

- FormData - a mobx-state-tree full of observable goodness that you can access all of your form state from the structure is based on your json schema. Import toJS() from mobx to see a snapshot of your form data tree.
- FormData.set(path, value) - a method that is used to set data within the tree for the supplied path.
- ErrorMap - a mobx observable map tree


A basic form with 2 text inputs and a save button.
~~~
import jsonSchema from "../../schemas/simple-form.json";
import {schema} from "../../form-capacitor";
import SimpleTextBox from "../controls/SimpleTextBox";
import {toJS} from "mobx";
import * as React from "react";
import FormErrors from '../FormErrors'
import {errorMapToFlatArray} from "../../form-capacitor/helpers";

@schema({
    schema: jsonSchema,
    $ref: "#/definitions/SimpleForm",
    default: {
        "lastName": "Bar"
    }
})
export default class SimpleForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            formState: undefined,
            validationErrors: undefined
        }
    }

    saveState = () => {
        if(this.props.validate()) {
            this.setState({formState: toJS(this.props.formData), validationErrors: undefined});
        } else {
            this.setState({formState: toJS(this.props.formData), validationErrors: errorMapToFlatArray(this.props.errorMap)});
        }
    };

    render() {
        const {formData, schema} = this.props;
        if(!formData) return <p>Loading schema...</p>;
        return (
            <div>
                <h1>Simple HTML Form</h1>

                <div>
                    <label htmlFor={`firstName`}>First Name</label>
                    <SimpleTextBox id={`firstName`} name="name" placeholder="a Name..."/>
                </div>

                <div>
                    <label htmlFor={`lastName`}>Last Name</label>
                    <SimpleTextBox id={`lastName`} name="name" placeholder="a Last Name..."/>
                </div>

                <FormErrors schema={schema} errors={this.state.validationErrors}/>

                <div>
                    <button onClick={this.saveState}>Save</button>
                </div>

                <textarea>{JSON.stringify(this.state.formState, null, 2)}</textarea>
            </div>
        );
    }
}
~~~

### `@consumeValue` decorator
Attach to any control and provide a handle change function to set the fc state for that input. The inputs are passed 
a name prop that defines what there path is in the tree. 

**props:**

- value - The value from the mobx state tree
- fc - An object that contains the following methods and properies

~~~
{

	hasErrors: boolean,
	errors: [{title: string, message: string}],
	set: function that sets the state for the input
}
~~~

This example is a SimpleTextBox Component which is a basic wrapped html text input.

~~~
import {consumeValue} from 'form-capacitor';
import * as React from "react";
import FieldErrors from "./FieldErrors";


@consumeValue()
export default class SimpleTextBox extends React.Component {
    handleChange = ev => {
        this.props.fc.set(ev.target.value || undefined);
    };

    render() {
        const {fc, value, ...props} = this.props;
        const errors = fc.errors;
        return <div>
            <input type="text" {...props} style={fc.hasErrors ? {border: "1px solid red"} : {}} value={value || ""} onChange={this.handleChange}/>
            <FieldErrors errors={errors}/>
        </div>;
    }

}
~~~

### `@consumeArray` decorator 

**props:**

- value - The value from the mobx state tree
- fc - An object that contains the following methods and properies
~~~
{

	hasErrors: boolean,
	errors: [{title: string, message: string}],
	set: function that sets the state for the input,
	clear: clears the underlying array,
   	remove(value): removes an item from the underlying array,	
}
~~~
This is for more advanced arrays for inputs like react-select.
~~~
import CreatableSelect from "react-select/lib/Creatable";
import {consumeArrayValue} from "form-capacitor";
import * as React from "react";
import css from "./ReactSelect.less";
import * as PropTypes from "prop-types";


@consumeArrayValue()
export default class ReactMultiSelect extends React.Component {
    static propTypes = {
        value: PropTypes.arrayOf(PropTypes.string, PropTypes.number),
        options: PropTypes.arrayOf(PropTypes.shape(
            {
                value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            }
        ))
    };

    removeValue = options => {
        if(options.length > 0) {
            this.props.fc.set(options.map(opt => opt.value));
        } else {
            this.clear();
        }
    };

    popValue = () => {
        this.props.fc.pop();
    };

    setValue = options => {
        //Shallow compare that ensures that the values is not in the array before pushing
        this.props.fc.set(options.map(opt => opt.value));
        // options.map(opt => (!this.props.value.includes(opt.value) && this.props.fc.push(opt.value)));
    };

    clear = () => {
        this.props.fc.clear();
    };

    changeActions = {
        "remove-value": this.removeValue,
        "pop-value": this.popValue,
        "set-value": this.setValue,
        "create-option": this.setValue,
        "select-option": this.setValue,
        "clear": this.clear,
    };

    handleChange = (options, type) => {
        this.changeActions[type.action.toString()](options);
    };

    render() {
        const {name, value, errors, options, fc, ...props} = this.props;
        const filtered = options === undefined ? value.map(v => ({label: v, value: v})) : value.map(v => options.find(opt => v === opt.value) || {label: v, value: v});
        return (
            <CreatableSelect isMulti {...props} value={filtered} options={options} className={errors && errors.size > 0 ? css["is-danger"] : undefined} onChange={this.handleChange}/>
        );
    }
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
develop forms that only re-render components where the state has changed for 
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

### onEvent Validation

The schema decorator passes a validation function as a prop to a form 
component decorated with the schema decorator that will fully 
validate the entire form data. This works nice if you want to roll your own
imperative validation on submit or change in focus or whatever.

### Errors

Errors can be managed at the consumer/input level via props.fc.hasErrors/props.fc.errors 
or at the form provider level via the props.errorMap observable map tree. 
The`errorMapToFlatArray` function included in form-capacitor will turn errorMap Tree 
into a flat array of error objects.    

## Why another form state / validation management library?

We have used formik and redux-forms which are great form state 
management libraries with many features and they make managing forms 
much easier but the complexity and amount of fields in our forms caused 
too performance issues including many re-renders so we decided 
to try to make a generic form library that could handle re-renders using a mobx-state-tree.
We also wanted to use standard validation syntax between front-end and back-end using json-schema.       

## Testing

Run `make test` to run all the tests and see a coverage report.
