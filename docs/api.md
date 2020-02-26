# API
- [`useForm`](#useform)
- [`useFormContext`](#useform)
- [`useField`](#usefield)
- [`useFieldErrors`](#usefielderrors)
- [`useArrayField`](#usearrayfield)
- [`useMaterialUiField`](#usematerialuifield)
- [`<FormSubSchema/>`](#<formsubschema\>)

## `useForm`

This `hook` returns a react `<Component/>` so it is kinda like a nasty hook + HOC hybrid.

Hooks are supposed to get rid of nesting, but we are using a <Context.Provider/> to manage all the nice form-capacitor things
and that is one of the reasons that we are using a hook that returns a Component.

Another reason we are using this strange pattern is this: 

If we want nice observables in our root form, we need to wrap the observables in an observer function so that they are 
accessible using the [`useFormContext()`](#useformcontext) hook which returns nice things like `status.isChanged`, 
and `stateTree` directly in our root form component and they will re-render automatically when they change.

###Usage

```jsx harmony
import { useForm, useFormContext } from 'form-capacitor'; 
import { observer } from "mobx-react-lite";
import jsonSchema from './SimpleForm.json'; 

export default function MyForm(){
    return useForm({
           schema: jsonSchema,
           $ref: "#/definitions/SimpleForm",
           default: {
               lastName: "Bar",
           },
        }, observer(() => {
            const {validate, stateTree} = useFormContext();
            return <div>
            <div>
                First Name
                <SimpleTextBox name="firstName"/>
            </div>
            <div>
                Last Name
                <SimpleTextBox name="lastName"/>
            </div>
            <div>
                <button onClick={() => validate() ? console.log("Passed", stateTree.toJSON()) : console.error("Failed")}>Save</button>}
            </div>
        </div>})
    );
}
```

###Params

1. options {}
   - `schema: {object}` : `require('/path/to/some-json-schema-file.json');`
   ```json
    {
      "$schema": "http://json-schema.org/draft-07/schema",
      "definitions": {
        "SimpleForm": {
          "title": "Simple Form",
          "description": "Basic Form to test form-capacitor without a lot of external stuff",
          "type": "object",
          "properties": {
            "firstName": {
              "type": "string",
              "title": "First Name",
              "pattern": "\\w"
            },
            "lastName": {
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
   ```   
   - `$ref: {string}`: `"#/definitions/SimpleForm"`
   - `default: {object}` - The default data to hydrate the form state tree with values. `optional`
   ```js
   {
       firstName : "Frosty",
       lastName  : "McCool"
   }
   ```
   - `actions {object}`: - An object of functions that is passed the mobx state tree and attaches actions to it. `optional`
   ```js
   (stateTree) => {
       generateCoolName: () => {   
          stateTree.firstName = "Anita";
          stateTree.lastName = "Sweater";
       } 
   }
   ```
   - `skipStateTreeSanitizer: {boolean}`: false - If this option is set to true the `validation`, `stateTree.toJS()` and `stateTree.toJSON()` functions will skip the sanitizer which recursively collapses empty arrays and objects to undefined.
  2. Function that returns a component wrapped in observer()

###Return

React Component

## `useFormContext`

This `hook` returns all of the Form.

Hooks are supposed to get rid of nesting, but we are using a <Context.Provider/> to manage all the nice form-capacitor things
and that is one of the reasons that we are using a hook that returns a Component.

The Other reason we are using this strange pattern is that if we want nice observables in our root form (which is not always the case), 
we can use observables such as `formStatus.isChanged` and `errorMap` and `formData` directly in our root form component.

###Usage

This method gives you access to the observables `formStatus`, `formData` and `errorMap` passed in as props as seen in the example below. 
```jsx harmony
import {useFormContext } from 'form-capacitor'; 

export default function InternalFormComponent(){
        const {status, stateTree, validate} = useFormContext();
        return <div>
        <div>
            Full Name: {stateTree.firstName} {stateTree.lastName}
        </div>
        <div>
            <button className={!status.isChanged ? "disabled" : "ready-to-rock" } onClick={() => validate() ? console.log("Passed", stateTree.toJSON()) : console.error("Failed")}>Submit</button>}
        </div>
    </div>;
}
```

###Params

Nope

###Return
```js
{
    stateTree        : {mobx-state-tree},
    status           : {observable Object},
    fieldMetaDataMap : Map,
    errorMap         : Observable Map,
    set              : function({}),
    reset            : function,
    validate         : function,
    path             : [],
    ready            : boolean
}
```
- stateTree - The mobx-state-tree containing all of the state data and actions of the form 
```js
{
    toJS   : function,//returns a POJO of the state tree
    toJSON : function,//returns a serialized JSON string of the state tree
}
``` 
- status - An observable object that holds various status booleans for the global state of the form 
  ```js
   {
       ready       : boolean,//is the form loaded and ready for use
       isDirty     : boolean,//Has the form state tree been touched ie has some change occured since the form defaults were set or since a 'reset' has occured
       isChanged   : boolean,//Is the stateTree different then when the defaults were set or 'reset' was called 
       hasErrors   : boolean//Does the form have any errors
   }
  ```
- fieldMetaDataMap - Flat map of all field meta data ie `required`, `isDirty`, `isChanged`. The map is keyed by the fields full path.
- errorMap - Recursive map of errors for the form 
- set - Function which takes a POJO which will replace all of the data in the stateTree with a new set of data
  ```js
  set({firstName: "Flerb", lastName: "Derp"});
  ```
- reset - Function which resets the form stateTree and errorMap to its default state
- validate - Function which will return true if the form passes validation and false if it does not. *(technically this is done automatically but if you wanna be real sure or you just want all error fields to highlight you can run it.)*
- path - Current path in context which will change based on if you are in a component nested in a <FormSubNode/> tag
- ready - Set to true when the form is loaded and ready for use

## `useField`

Hook that connects various form inputs to the state tree

###Usage
```jsx harmony
import { TextField } from '@material-ui/core';
import {useField, useFieldErrors} from "../src";

function SimpleTextBox({name}) {
    const [value, change, {label: title, required}] = useField(name);
    const [hasErrors] = useFieldErrors(name);
    return <span>
        <TextField name={name} label={label} value={value} required={required} onChange={change}/>
    </span>;
}
```
###Params

name - string - String path to the field via the json-schema that is delimited by the . character.

###Return
```js
[
    value: any,//the value of the field from the stateTree 
    change: function,//a mutator function to change the value that accepts a single param the new value
    metaData: {
        required: boolean//true if the field is required
        title: string,//The title or label of the field
        isDirty: boolean,//true if the field has been touched
        isChanged: boolean,//true if the field is different from the default value      
    }
]
```

## `useFieldErrors`

Hook to wire various error states and messages

###Usage
```jsx harmony
import {TextField} from '@material-ui/core';
import {useFieldErrors} from "../src";

function FieldErrors({name}) {
    const [hasErrors, errors] = useFieldErrors(name);
    return {hasErrors && <ul>
        {errors.map((err, errKey) => <li key={errKey}>err.message</li>)}
    </ul>};
}
```
###Params

name - string - path to the field via the json-schema that is delimited by the . character.

###Return
```js
[
    hasErrors: boolean,//true if the field has erors 
    errors: [
        {
            title: string,//the title of the field
            message: string.//the error message
            path: string[],//the path to the field
            keyword: string,//the ajv/json-schema keyword that triggered the error 
        }
    ]
]
```

## `useArrayField`

hook that grabs the value of the field and an object full of array mutator functions 

###Usage
```jsx harmony
import {Select} from 'react-select';
import {useArrayField} from "../src";

function SimpleSelectDropdown({name}) {
    const [value, {set, push, remove}] = useArrayField(name);    

    return <Select value={value}/>;
}
```
###Params

name - string - path to the field via the json-schema that is delimited by the . character.

###Return
```js
[
    value: any,//the value of the field from the stateTree 
    mutators: {
        set: function(newArray)//set the array to a new array
        push: function(...any),//pushed all params onto the end of the array
        pop: function(),//pops the last element off of the end of the array
        remove: function(value),//removes an element that is === to the value param       
        splice: function(start, deleteCount, optionalElementToSpliceIn),//mutates and array according to the rules of splice.       
        replace: function(start, deleteCount, optionalElementToSpliceIn),//mutates and array according to the rules of splice.       
    }
]
```
## `useMaterialUiField`

Hook that connects material-ui inputs to the state tree

###Usage
```js
import {TextField} from '@material-ui/core';
import {useMaterialUiField} from "../src";

function SimpleTextBox({name}) {
    const fieldAttributes = useMaterialUiField(name);
    return <TextField name={name} {...fieldAttributes}/>;
}
```
###Params

name - string - path to the field via the json-schema that is delimited by the . character.

###Return
```js
{
    name: string,
    label: string,
    required: boolean,
    error: boolean,
}

```
## `<FormSubNode/>`

Tag which nests the path stored in context so that you can just use the field names instead of long paths with . in them for the name params for the Field hooks.

###Usage
```js
import {FormSubNode} from "../src";
/*This example is contrived to illustrate how you could nest/group arrays of objects on a form
*/ 

function Contacts({name}) {
    return <FormSubNode path="contacts">
        <FormSubNode path="0">
            <div>
                <h1>Primary Contact</h1>
            </div>
            <div>
                First Name
                <SimpleTextBox name="firstName"/>
            </div>
            <div>
                Last Name
                <SimpleTextBox name="lastName"/>
            </div>
        </FormSubNode>
        <FormSubNode path="1">
            <div>
                <h1>Secondary Contact</h1>
            </div>
            <div>
                First Name
                <SimpleTextBox name="firstName"/>
            </div>
            <div>
                Last Name
                <SimpleTextBox name="lastName"/>
            </div>
        </FormSubNode>
    </FormSubNode>;
}
```
###Props

path - string - path to nest elements under that is delimited by the . character.