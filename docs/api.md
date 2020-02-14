# API
- [`useForm`](#useform)
- [`useFormContext`](#useform)
- [`useField`](#usefield)
- [`useFieldErrors`](#usefielderrors)
- [`useArrayField`](#usearrayfield)
- [`splitFormProps`](#splitformprops)
- [`useFormContext`](#useformcontext)

## `useform`

This `hook` returns a react `<Component/>` so it is kinda like a nasty hook + HOC hybrid.

Hooks are supposed to get rid of nesting, but we are using a <Context.Provider/> to manage all the nice form-capacitor things
and that is one of the reasons that we are using a hook that returns a Component.

The Other reason we are using this strange pattern is that if we want nice observables in our root form (which is not always the case), 
we can use observables such as `formStatus.isChanged` and `errorMap` and `formData` directly in our root form component.

###Usage

This method gives you access to the observables `formStatus`, `formData` and `errorMap` passed in as props as seen in the example below. 
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

###params

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
  2. Function that returns a component wrapped in observer()
