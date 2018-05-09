# form-capacitor mono-repo

form-capacitor was originally intended as a simple validation library for React. As the project grew, however, it became apparent that you cannot validate input without having access to all the form state. As such, it can now manage form state. However, that turned out to be quite useful all on its own, so now we have several independent packages.

## Goals

1. Provide a simple framework for validating form input in real-time
    1. Support as many use-cases as possible so that users are never confused about where the error has occurred
2. Aggregate form state into single object for easy serialization and submission
    1. Allow this state to affect the rendering of the form (show/hide fields based on prior inputs, or display input in plain-text)
3. Extract the schema into a language-agnostic data interchange format for non-React + server-side validation

## Process

From bottom-up, the process is:

1. Convert the schema DSL into JSON at compile-time for easy use at run-time and for server-side validation
2. Run the JSON schema against the state tree
    1. Client: In real-time, as the user is filling out the form
    2. Client: When the user submits the form
    3. Server: Again on the server
3. Use the output from the previous step to display error messages 
    1. Client: Highlight erroneous fields and display error messages next to them
    1. Server: Build a paragraph describing the errors if it somehow passes client-side validation
4. Use the meta-data we've collected about the form state to determine which fields have been modified for additional UI hints such as disabling Submit buttons or highlighting modified fields.

## Packages

FormCapacitor is split into several packages, some of which can be used indepently, or subbed out for different implementations if you don't like their behaviour.

Please see the `packages/` directory for details. Eventually™ they will be listed here with a short description.
