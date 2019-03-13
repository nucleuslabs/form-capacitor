# form-capacitor - 

**!!!Highly Experimental Project!!!**

Form manager for [`react`](https://github.com/facebook/react) that makes 
use of mobx for state and ajv for validation.


Form capacitor is a set of Higher Order Components that help you manage the 
state, validation and errors for react forms that are defined using json-schema. 


With form-capacitor you can use 1 json-schema and 2 or 3 decorators to setup your 
form state management and validation.  

## Usage

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
### @schema decorator
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

### @consumeValue decorator

The schema decorator wraps the form in a HOC with context provider that feeds 
FormCapacitor props to your form component.

**@schema Options:**



**props:**
- FormData - a mobx-state-tree full of observable goodness that you can access all of your form state from the structure is based on your json schema. Import toJS() from mobx to see a snapshot of your form data tree.
- setFormData() - a method that is used to set data within the tree.
- clearFormData() - a method to set format





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

### @consumeArray decorator 
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

Will write something here at some point   

## Why another form state / validation management library?

We have used formik and redux-forms which are great form state 
management libraries with many features and they make managing forms 
much easier but the complexity and amount of fields in our forms caused 
too many re-renders so we decided to try to make a form library that could 
handle re-renders using mobx. We also wanted to use standard validation
syntax between front-end and back-end.       

