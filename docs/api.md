#Form Capacitor API

[TOC]

## `useForm`

This `hook` returns a react `<Component/>` so it is kinda like a nasty hook + HOC hybrid.

Hooks are supposed to get rid of nesting, but we are using a <Context.Provider/> to manage all the nice form-capacitor things
and that is one of the reasons that we are using a hook that returns a Component.

Another reason we are using this strange pattern is this: 

If we want nice observables in our root form, we need to wrap the observables in an observer function so that they are 
accessible using the [`useFormContext()`](#useformcontext) hook which returns nice things like `status.isChanged`, 
and `stateTree` directly in our root form component and they will re-render automatically when they change.

### Usage
```jsx
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

### Params
#### `options`
| OPTION                  | TYPE        | DESCRIPTION                                                                  |
|-------------------------|-------------|------------------------------------------------------------------------------|
| `schema`                | `Object`    | json-schema v7 object                                                        |
| `$ref`                  | `string`    | json-schema path to the  core form object                                    |
| `default`               | `Object`    | POJO with the default data for the form                                      |
| `views`                 | `function`  | Function that defines calculated memoized functions that contain form state  |
| `actions`               | `function`  | Function that defines actions to mutate the form state                       |
| `skipStateTreeSanitizer`| `boolean`   | If true Skips the sanitization function to collapse empty objects and arrays |

##### json-schema v7 object example 
| PARAM    |      TYPE     |  DESCRIPTION                  |
|----------|---------------|-------------------------------|
| `schema`    |  POJO       | json-schema v7 definition    |
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
##### `$ref` example
`#/definitions/SimpleForm`
##### `default` example 
```js
const defaults = {
   firstName : "Frosty",
   lastName  : "McCool"
};
```
##### `views` example
```js
const views = stateTree => ({
 get fullName() {
  return `${stateTree.firstName} ${stateTree.lastName}`;
 },
 get initials() {
  return `${stateTree.firstName.substring(0,1).upper()}. ${stateTree.lastName.substring(0,1).upper()}.`;
 }
});
```
##### `actions` example
```js
const actions = stateTree => ({
       generateCoolName: () => {   
          stateTree.firstName = "Anita";
          stateTree.lastName = "Sweater";
       } 
   });
```
#### `FunctionalComponent`
| PARAM                 |      TYPE     |  DESCRIPTION                                                                               |
|-----------------------|---------------|--------------------------------------------------------------------------------------------|
| `FunctionalComponent` |  `function`   | Functional component wrapped in the mobx-react-lite `observer()` function                  |

This acts similar to a Higher Order Component. Although most hooks are supposed to reduce nesting, in this case  we are using context and 
we found wrapping the component with an observer function was convenient and easy to read. 

You only need to wrap the component in observer if you intend to use the useFormContext hook any where within the form. 

If you plan on DO NOT use any observables ie `formStateTree` or `erroMap` but only use the `useField`, `useFieldArray` and/or `useFormErrors` 
hooks in sub components they are pre-wrapped for you so you DO NOT need to wrap your functional component in `observer()`.  

## `useFormContext`

This `hook` returns an object containing some fun observables `formState`, `status`, `errorMap` and a few actions.

### Usage
```jsx
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
### Params

Nope... It uses context because global variables patterns are acceptable as long as they are scoped and not called global variables.

### Return
| PROPERTY                | TYPE        | DESCRIPTION                                                                  |
|-------------------------|-------------|------------------------------------------------------------------------------|
| `stateTree`             | `Object`    | mobx-state-tree containing all of the form state, views and actions          |
| `status`                | `Object`    | Observable Object that holds status booleans                                 |
| `fieldMetaDataMap`      | `Map`       | Flat map keyed by field path containing meta data for each fields            |
| `errorMap`              | `Map`       | Traversable Map object of all of the Errors that exist in the form           |
| `set`                   | `function`  | Function which is a stateTree action to set data within the stateTree        |
| `reset`                 | `function`  | Function which is a stateTree action tyhat sets a form back to default state |
| `validate`              | `function`  | Function to call imperative  validation for the form and sets errors         |
| `path`                  | `string[]`  | array of the current base path for the form                                  |

#### stateTree 
| BUILT-IN ACTION         | DESCRIPTION                                                                  |
|-------------------------|------------------------------------------------------------------------------|
| `stateTree.toJS()`      | Returns an POJO of the stateTree                                             |
| `stateTree.toJSON()`    | Returns a json string                                                        |

#### status 
| BOOLEAN        | DESCRIPTION                                                                       |
|----------------|-----------------------------------------------------------------------------------|
| `ready`        | Form is loaded and ready for action                                               |
| `isDirty`      | Has the form state tree been touched ie has some change occured since the form defaults were set or since a 'reset' has occured |
| `isChanged`    | Is the stateTree different then when the defaults were set or 'reset' was called. |
| `hasErrors`    | Does the form have any errors                                                     |

#### fieldMetaDataMap

Flat map of all field meta data ie {`required`, `title`}. The map is keyed by the fields full path.

#### set
Usage 1 - Replace stateTree with new data:
```js
set({firstName: "Flerb", lastName: "Derp"});
```
Usage 2 - Set a field in the state tree directly:
```js
set('firstName', "Flerb");
```
## `useField`

Hook that connects various form inputs to the state tree

### Usage
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
### Params
| PARAM                 |      TYPE     |  DESCRIPTION                                                                               |
|-----------------------|---------------|--------------------------------------------------------------------------------------------|
| `name/path`           |  `string`     | String path for the field via the json-schema that is delimited by the ``.`` character.    |

### Return
| PARAM                   | TYPE        | DESCRIPTION                                                                  |
|-------------------------|-------------|------------------------------------------------------------------------------|
| `value`                 | `???`       | value for the field                                                          |
| `change`                | `function`  | mutator function to change the value for the field in the state tree         |
| `fieldMetaData`         | `Object`    | meta data for field                                                          |

#### change
| PARAM                   | TYPE        | DESCRIPTION                                                                  |
|-------------------------|-------------|------------------------------------------------------------------------------|
| `newValue`              | `???`       | new value for the field                                                      |

#### fieldMetaData
| PROPERTY                | TYPE        | DESCRIPTION                                                                  |
|-------------------------|-------------|------------------------------------------------------------------------------|
| `title`                 | `string`    | new value for the field                                                      |
| `required`              | `boolean`   | is the field required?                                                       |
| `isDirty`               | `boolean`   | has the field been touched?                                                  |
| `isChanged`             | `boolean`   | has the field changed from the default                                       |

## `useFieldErrors`

Hook to wire various error states and messages to fields or field containers.

### Usage
```jsx
import {TextField} from '@material-ui/core';
import {useFieldErrors} from "../src";

function FieldErrors({name}) {
    const [hasErrors, errors] = useFieldErrors(name);
    return {hasErrors && <ul> {errors.map((err, errKey) => <li key={errKey}>err.message</li>)} </ul>};
}
```
### Params
| PARAM                 |      TYPE     |  DESCRIPTION                                                                               |
|-----------------------|---------------|--------------------------------------------------------------------------------------------|
| `name/path`           |  `string`     | String path for the field via the json-schema that is delimited by the ``.`` character.    |

### Return
| PARAM                   | TYPE        | DESCRIPTION                                                                  |
|-------------------------|-------------|------------------------------------------------------------------------------|
| `hasErrors`             | `boolean`   | does this field have validation errors                                       |
| `errors`                | `Object[]`  | array of error objects with user friendly validation error messages          |

#### error
| PROPERTY                | TYPE        | DESCRIPTION                                                                  |
|-------------------------|-------------|------------------------------------------------------------------------------|
| `title`                 | `string`    | field title... so verbose                                                    |
| `message`               | `string`    | error message.. which will already contain the error title unless you make custom error messages |
| `path`                  | `string[]`  | array path  where the error occurred                                         |
| `keyword`               | `boolean`   | json-schema keyword for the error                                            |

##`useArrayField`

hook that grabs the value of the field and an object full of array mutator functions 

### Usage
```jsx
import {Select} from 'react-select';
import {useArrayField} from "../src";

function SimpleSelectDropdown({name}) {
    const [value, {set, push, remove}] = useArrayField(name);    

    return <Select value={value}/>;
}
```
### Params
| PARAM                 |      TYPE     |  DESCRIPTION                                                                               |
|-----------------------|---------------|--------------------------------------------------------------------------------------------|
| `name/path`           |  `string`     | String path for the field via the json-schema that is delimited by the ``.`` character.    |

### Return
| PARAM                   | TYPE        | DESCRIPTION                                                                  |
|-------------------------|-------------|------------------------------------------------------------------------------|
| `value`                 | `Array`     | array of things in the stateTree for suplied name/path                       |
| `Mutators`              | `Object`    | object with all the functions to mutate the array                            |

#### Mutators
| MUTATOR                 | PARAMS       | DESCRIPTION                                                                  |
|-------------------------|--------------|------------------------------------------------------------------------------|
| `set`                   | (array)      | set the array to a new array                                                 |
| `push`                  | `(...params)`| push all params onto the end of the array                                    |
| `pop`                   | `string[]`   | pops the last element off of the end of the array                            |
| `remove`                | (value)      | removes an element that is === to the value param                            |
| `splice`                | (start, deleteCount, optionalElementToSpliceIn) | mutates and array. See [splice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) |
| `replace`               | (array)      | replaces the current array with a new array                                  |

## `useMaterialUiField`

Hook that connects material-ui inputs to the state tree

### Usage
```js
import {TextField} from '@material-ui/core';
import {useMaterialUiField} from "../src";

function SimpleTextBox({name}) {
    const fieldAttributes = useMaterialUiField(name);
    return <TextField name={name} {...fieldAttributes}/>;
}
```
### Params
| PARAM                 |      TYPE     |  DESCRIPTION                                                                               |
|-----------------------|---------------|--------------------------------------------------------------------------------------------|
| `name/path`           |  `string`     | String path for the field via the json-schema that is delimited by the ``.`` character.    |

### Return
| PROPERTY                | TYPE        | DESCRIPTION                                                                  |
|-------------------------|-------------|------------------------------------------------------------------------------|
| `name`                  | `string`    | field name                                                                   |
| `value`                 | `???`       | value for the field                                                          |
| `label`                 | `string`    | title of the field                                                           |
| `required`              | `boolean`   | is field required?                                                           |
| `onChange`              | `function`  | Setter function that changes the value for the field in the stateTree        |
| `FormHelperTextProps`   | `Object`    | Object containing errors in divs                                             |

#### FormHelperTextProps
| PROPERTY                | TYPE        | DESCRIPTION                                                                  |
|-------------------------|-------------|------------------------------------------------------------------------------|
| `children`              |`Comopnent[]`| Returns an array of error messages wrapped in divs                           |

## `useFormErrors`

All the errors 

### Usage
```jsx
import {useFormErrors} from "../src";

function SomeCoolErrorComponent({name}) {
    const [hasErrors, errors] = useFormErrors();
    return {hasErrors && <ul>errors.map((e, eIdx) => <li key={eIdx}>{e.message}</li>)}</ul>;
}
```
### Params

Nope

### Return
| PARAM                 |      TYPE     |  DESCRIPTION                                                                               |
|-----------------------|---------------|--------------------------------------------------------------------------------------------|
| `hasErrors`           | `boolean`     | true if the form has errors                                                                |
| `errros`              | `string[]`    | flattened array of all current validation errors                                           |

## `<FormSubNode/>`

Tag which nests the path stored in context so that you can just use the field names instead of long paths with . in them for the name params for the Field hooks.

### Usage
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
### Props
| PROP                  |      TYPE     |  DESCRIPTION                                                                               |
|-----------------------|---------------|--------------------------------------------------------------------------------------------|
| `name/path`           |  `string`     | String path to nest components within that is delimited by the ``.`` character.            |