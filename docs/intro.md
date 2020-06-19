# Form-Capacitor

Form capacitor is a library for building fast responsive forms with state management, nesting, dynamic repeatable input support, serialization and as you type validation/error generation using json-schema packaged into a few hooks.  

## What it does

- Form State Management
- Validation (Declarative As you type and Imperative Full Form Validation)
- Provides thoughtfully combined default Error Messages (automated or parses custom Error Messages direct from json-schema)
- Tree Serialization as a POJO or a JSON string

## What it doesn't do

- Submit handling 
  - Presently the handy `hasErrors` boolean as well as the `toJS()` and `toJSON()` methods included in `useFormContext` allow you to roll your own XHR REST Requests, Graphql Mutations or Whatever)
  - In the not to distant future we are mulling over building some default REST and Apollo hooks that will pass you back a submit handler which will use a standard toast for errors and do all the submitty things)
- Custom async validation (ie checking for username uniqueness using fetch to check a service)
  - Presently we give you access to add and clear your own custom errors, but we know that is weaksauce
  - We are still deciding how we want to tackle support for async validations being that the json-schema can be validated reliably on both client and server. Async validations typically rely on logic and external factors which may have a mismatch between client and server logic.  
- a few json-schema things are not yet supported 
   - oneOf 
   - allOf (This might work, but has NOT been tested yet.)
   - array tuple validation (This might work, but has NOT been tested yet.)
   - json-schema versions 1-6 (will not support)
   - json-schema 8

## Roadmap

1. Submit handler generating hooks
2. More json-schema keyword support/testing
3. Custom async validation (ie checking for username uniqueness using fetch to check a service)
4. json-schema 8 support (waiting on AJV to support 8)

## Browser Support

- Modern browsers
- Internet Explorer 11

## Peer dependencies

- react and react-dom 16.8+ (the ones with hooks)
- mobx 4 (the one with IE support)
- mobx-state-tree
- mobx-react-lite
- json-schema-ref-parser
- ajv

## What does it have going for it?

- Standardized validation rule sets built using json-schema v7 that can be reliably applied to both client and server 
- Strongly typed form state tree using mobx-state-tree
- Ultra fast as you type scoped validation using ajv
- Great default error messages that are friendly to humans under stress and also highly customizable
- Easy to hook-up to inputs even crazy advanced inputs like react-select, react-datepicker or material-ui using... hooks
- Easy to move error messages around and collect groups of errors for more complex data structures like objects and arrays 
- Easy to nest so that nested fields don't have to include long path names in so they are easier to move if schema changes
- Functions that allow you to work with array data types ie multi-selects using mutators like push, pop, splice, remove that are re

## Form-capacitor works great for the following:

- Forms with dynamic endless repeating sections with text area's, react-selects, react-multi-selects, date pickers, email inputs and min max number inputs  
- Complicated anyOF and All-Or-Nothing/dependency rules with conditional related field validation.
- As you type validation.
- Situations where you validate data both on the client side as you type and also server-side on submit using a language that has a json-schema validator like PHP, python, JS, and probably others
- Having observable based form and field meta properties that are nice and quick and great for auto triggering re-renders only 

## Why did we develop another form state / validation management library?

We have used formik and redux-forms which are great form state management libraries with many 
features and they make managing forms much easier. 

The complexity and amount of fields in the forms we were using for medical applications. Full form re-renders 
when the form state was updated were causing performance issues and typing would slow down and stutter 
in textareas and text inputs.

We decided to make a generic form library that could handle re-renders using a mobx-state-tree.

We also wanted to use standard validation syntax between front-end and back-end using json-schema.       

Although Formik and redux-forms did not perform well for our complex forms with as you type validation enabled 
at the time we used them in early 2019, they may be faster now, I am not sure. 

## Pros

1. It is Fast - Form state is stored in observables so it's performance is not hindered by challenges such as having a large number of inputs and doing as you type validation on fields
2. Supports IE 11 
3. Supports big complex forms and works well with repeatable dynamic input collections
4. Supports nth level nesting and grouping
5. Has pretty error messages
6. Using Json-schema allows you to validate the form in the browser and server using the same ruleset
7. React 16.8 hooks based API, the hooks work very similar to `useState` and `useContext` :)
8. Easy to use with both simple 2 field and super complex forms
9. Works well with popular UI components like react-select and react-datepicker and material UI Components
10. Not too many dependencies mostly peerDependencies 

## Cons

1. Only supports React 16.8 or newer because it uses Hooks :(
2. Only supports [json-schema draft 7](https://json-schema.org/draft-07/json-schema-release-notes.html) no other versions are supported at this time the main reason for this is that as of this writing AJV doesn't support version 8
3. Does NOT support json-schema oneOf keyword (pull requests welcome)
4. One of the hook functions `useForm` is actually Hook + HOC hybrid which may seem weird but we found this pattern very convenient and to have high performance when working with mobx observables.
5. For complex state with deep tree structures you have to either specify the full path in the name of a Consumer Component which employs path separation using the '.' character i.e "demographicInfo.homeAddress.postalCode" for each input or wrap them in a `<SubScehma path={name}>` which will set the proper paths in context. (if you can think of a magical way to propagate paths without wrapping please submit a pull request)
6. Only supports mobx 4 at this time due to many agencies in Canada still using IE 11
7. Does not yet support submit handling (this is on the roadmap and will be in the 1.0 or 1.1 release) 
8. Does not yet support async validations like checking a server for the uniqueness of a username (this is on the roadmap)
