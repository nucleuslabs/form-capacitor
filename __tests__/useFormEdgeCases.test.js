import {useField, useFieldErrors, useForm, useFormContext} from "../src";
import {observer} from "mobx-react-lite";
import React from "react";
import {render, waitFor} from "@testing-library/react";
import {PROJECT_NAME_VERSION} from "../src/helpers";
import jsonSchema from "./demo-form.json";

function SimpleTextBox(props) {
    const [value, change] = useField(props.name);
    const [hasErrors, errors] = useFieldErrors(props.name);
    return <span>
        <input type="text" {...props} className={hasErrors ? "error" : null} value={value || ""} onChange={ev => {
            change(ev.target.value || undefined);
        }}/>
        <div data-testid={`${props.name}_errors`}>{hasErrors &&
        <ul>{errors.map((error, eIdx) => <li key={eIdx}>{error.message}</li>)}</ul>}</div>
    </span>;
}

function ErrorComponent ({message}) {
    return <div data-testid="error">{message}</div>;
}

const badSchema = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "definitions": {
        "DemoForm": {
            "title": "Demo Form",
            "description": "Basic Form to demo core features of FormCapacitor",
            "type": "object",
            "properties": {
                "firstName": {
                    "type": "chicken",
                    "title": "First Name",
                    "maxLength": 20,
                    "minLength": 2,
                    "pattern": "\\w"
                },
                "middleName": {
                    "type": "string",
                    "title": "Middle Name",
                    "pattern": "\\w"
                },
                "lastName": {
                    "type": "string",
                    "title": "Last Name",
                    "pattern": "\\w"
                },
                "aka": {
                    "type": "string",
                    "title": "AKA",
                    "pattern": "\\w"
                },
                "phone": {
                    "type": "string",
                    "title": "Phone",
                    "pattern": "\\(\\d+\\)\\d+"
                },
            }
        }
    }
};

function SchemaErrorForm() {
    return useForm({
        schema: {...badSchema},
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
            alias: []
        },
        ErrorComponent: ErrorComponent
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
        </div>;
    }));
}

function SchemaErrorFormNoRef() {
    return useForm({
        schema: {
            "title": "Demo Form",
            "description": "Basic Form to demo core features of FormCapacitor",
            "type": "object",
            "properties": {
                "firstName": {
                    "type": "chicken",
                    "title": "First Name",
                    "maxLength": 20,
                    "minLength": 2,
                    "pattern": "\\w"
                },
                "middleName": {
                    "type": "string",
                    "title": "Middle Name",
                    "pattern": "\\w"
                },
                "lastName": {
                    "type": "string",
                    "title": "Last Name",
                    "pattern": "\\w"
                },
                "aka": {
                    "type": "string",
                    "title": "AKA",
                    "pattern": "\\w"
                },
                "phone": {
                    "type": "string",
                    "title": "Phone",
                    "pattern": "\\(\\d+\\)\\d+"
                },
            }
        },
        default: {
            lastName: "Bar",
            alias: []
        },
        ErrorComponent: ErrorComponent
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
        </div>;
    }));
}

function DefaultErrorForm() {
    return useForm({
        schema: {...jsonSchema},
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: {"hockey": "sport"},
            alias: []
        },
        ErrorComponent: ErrorComponent
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
        </div>;
    }));
}

function NoRefForm() {
    return useForm({
        schema: {
            "title": "Demo Form",
            "description": "Basic Form to demo core features of FormCapacitor",
            "type": "object",
            "properties": {
                "firstName": {
                    "type": "string",
                    "title": "First Name",
                    "maxLength": 20,
                    "minLength": 2,
                    "pattern": "\\w"
                },
                "middleName": {
                    "type": "string",
                    "title": "Middle Name",
                    "pattern": "\\w"
                },
                "lastName": {
                    "type": "string",
                    "title": "Last Name",
                    "pattern": "\\w"
                },
                "aka": {
                    "type": "string",
                    "title": "AKA",
                    "pattern": "\\w"
                },
                "phone": {
                    "type": "string",
                    "title": "Phone",
                    "pattern": "\\(\\d+\\)\\d+"
                },
            }
        },
        default: {
            firstName: "Foo",
            lastName: "Bar"
        },
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
        </div>;
    }));
}

function StateTreeFunctionTestForm() {
    return useForm({
        schema: JSON.parse(JSON.stringify(jsonSchema)),
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
            alias2: ['one','three'],
            alias: [{alias: 'one'}, {alias: 'two'}, {alias: 'three'}]
        },
        views: self => ({
            get numberOfAliases() {
                return self.alias.length + self.alias2.length;
            }
        }),
        ErrorComponent: ErrorComponent
    }, observer(() => {
        const {stateTree, status} = useFormContext();
        // const changed = "true";
        const changed = stateTree._isChanged() ? "true" : "false";
        let _set = "";
        let _setRoot2 = "";
        let _setRoot = "";
        try {
            stateTree._set("flergaer", "derger");
            stateTree._set(["blurgru", "sturgur"], "derger");
        } catch(error){
            _set = error.message;
        }
        try {
            stateTree._setRoot("flergaer");
        } catch(error){
            _setRoot = error.message;
        }
        try {
            stateTree._setRoot({"firstName": ["cheese"]});
        } catch(error){
            _setRoot2 = JSON.stringify(error);
        }
        stateTree._splice('alias2',1,0,'two');
        const aliases = stateTree.alias2.join(",");
        stateTree._splice('alias2',2);
        const aliases2 = stateTree.alias2.join(",");
        const _pop = stateTree._pop('alias2');
        let _clear = "0";
        try {
            stateTree._clear('alias');
        } catch(error){
            _clear = "Failure";
        }
        // const _clear = stateTree.alias.length;
        try {
            stateTree._setRoot({"firstName": ["cheese"]});
            console.log("All good??!?");
        } catch(error){
            _setRoot2 = JSON.stringify(error);
        }
        return <div>
            <div data-testid="changed">{changed}</div>
            <div data-testid="_set">{_set}</div>
            <div data-testid="_setRoot">{_setRoot}</div>
            <div data-testid="_setRoot2">{_setRoot2}</div>
            <div data-testid="aliases">{aliases}</div>
            <div data-testid="aliases2">{aliases2}</div>
            <div data-testid="_pop">{_pop}</div>
            <div data-testid="_clear">{_clear}</div>
            <div data-testid="numberOfAliases">{stateTree.numberOfAliases}</div>
            <div data-testid="hasErrors">{status.hasErrors ? "1" : "0"}</div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
            </div>
        </div>;
    }));
}

function RequiredFieldDoesNotExistForm() {
    return useForm({
        schema: {
            "$schema": "http://json-schema.org/draft-07/schema",
            "definitions": {
                "DemoForm": {
                    "title": "Demo Form",
                    "description": "Basic Form to demo core features of FormCapacitor",
                    "type": "object",
                    "properties": {
                        "firstName": {
                            "type": "string",
                            "title": "First Name",
                            "maxLength": 20,
                            "minLength": 2,
                            "pattern": "\\w"
                        },
                        "lastName": {
                            "type": "string",
                            "title": "Last Name",
                            "pattern": "\\w"
                        }
                    },
                    "required": ["flerberderb"]
                }
            }
        },
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
        }
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
                <span>Last Name</span>
                <SimpleTextBox data-testid="lastName" name="lastName"/>
            </div>
        </div>;
    }));
}

function DependencyDoesNotExistForm() {
    return useForm({
        schema: {
            "$schema": "http://json-schema.org/draft-07/schema",
            "definitions": {
                "DemoForm": {
                    "title": "Demo Form",
                    "description": "Basic Form to demo core features of FormCapacitor",
                    "type": "object",
                    "properties": {
                        "firstName": {
                            "type": "string",
                            "title": "First Name",
                            "maxLength": 20,
                            "minLength": 2,
                            "pattern": "\\w"
                        },
                        "lastName": {
                            "type": "string",
                            "title": "Last Name",
                            "pattern": "\\w"
                        }
                    },
                    "dependencies": {
                        "flerberderb": [
                            "firstName",
                            "lastName"
                        ]
                    }
                }
            }
        },
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
        }
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
                <span>Last Name</span>
                <SimpleTextBox data-testid="lastName" name="lastName"/>
            </div>
        </div>;
    }));
}

function DependencyDoesNotExist2Form() {
    return useForm({
        schema: {
            "$schema": "http://json-schema.org/draft-07/schema",
            "definitions": {
                "DemoForm": {
                    "title": "Demo Form",
                    "description": "Basic Form to demo core features of FormCapacitor",
                    "type": "object",
                    "properties": {
                        "firstName": {
                            "type": "string",
                            "title": "First Name",
                            "maxLength": 20,
                            "minLength": 2,
                            "pattern": "\\w"
                        },
                        "lastName": {
                            "type": "string",
                            "title": "Last Name",
                            "pattern": "\\w"
                        }
                    },
                    "dependencies": {
                        "firstName": [
                            "lastName",
                            "flerberderb"
                        ]
                    }
                }
            }
        },
        $ref: "#/definitions/DemoForm",
        default: {
            lastName: "Bar",
        }
    }, observer(() => {
        return <div>
            <div>
                <span>First Name</span>
                <SimpleTextBox data-testid="firstName" name="firstName"/>
                <span>Last Name</span>
                <SimpleTextBox data-testid="lastName" name="lastName"/>
            </div>
        </div>;
    }));
}

const originalError = console.error;
const errorSet = new Set();
const mockedError = function (message) {
    errorSet.add(message);
};

beforeEach(() => {
    errorSet.clear();
    console.error = mockedError;
});

afterEach(() => {
    console.error = originalError;
});

test("Test erroneous schema .", async () => {
    const {getByTestId} = render(<SchemaErrorForm/>);
    await waitFor(() => getByTestId("error"));
    const $ref = "#/definitions/DemoForm";
    const errStr = `${PROJECT_NAME_VERSION} An error occurred in the useForm hook while creating the mobx Type Model for the stateTree using options.schema${$ref ? ` for $ref: ${$ref}` : ''}. This could be a bug but it could also be an error in the json-schema, please check the schema for errors or unsupported features.`;
    expect(errorSet.has(errStr)).toBe(true);
    expect(getByTestId("error").innerHTML).toContain("chicken");
});

test("Test erroneous schema with no ref .", async () => {
    const {getByTestId} = render(<SchemaErrorFormNoRef/>);
    await waitFor(() => getByTestId("error"));
    const errStr = `${PROJECT_NAME_VERSION} An error occurred in the useForm hook while creating the mobx Type Model for the stateTree using options.schema. This could be a bug but it could also be an error in the json-schema, please check the schema for errors or unsupported features.`;
    expect(errorSet.has(errStr)).toBe(true);
    expect(getByTestId("error").innerHTML).toContain("chicken");
});

test("Test erroneous defaults .", async () => {
    const {getByTestId} = render(<DefaultErrorForm/>);
    await waitFor(() => getByTestId("error"));
    const errIterator = errorSet.values();
    for(const errStr of errIterator) {
        expect(errStr).toContain(`${PROJECT_NAME_VERSION} had trouble setting defaults in useForm hook. Make sure the types in options.default match what is defined in options.schema.`);
        expect(errStr).toContain(`${PROJECT_NAME_VERSION} could not set [lastName] to {"hockey":"sport"}`);
    }
});

test("Test _ functions bound to mobx stateTree.", async () => {
    const {getByTestId} = render(<StateTreeFunctionTestForm/>);
    await waitFor(() => getByTestId("changed"));
    expect(getByTestId("changed").innerHTML).toContain("true");
    expect(getByTestId("_set").innerHTML).toContain("Could not assign a value in the form-capacitor schema for path");
    expect(getByTestId("_setRoot").innerHTML).toContain("Replace must be passed a javascript object");
    expect(getByTestId("_setRoot2").innerHTML).toContain("{\"schemaAssigmentErrors\":[{\"prop\":\"firstName\",\"value\":[\"cheese\"],\"error\":{}}]}");
    expect(getByTestId("aliases").innerHTML).toContain("one,two,three");
    expect(getByTestId("aliases2").innerHTML).toContain("one,two");
    expect(getByTestId("_pop").innerHTML).toEqual("two");
    expect(getByTestId("_clear").innerHTML).toEqual("0");
    expect(getByTestId("numberOfAliases").innerHTML).toEqual("1");
    expect(getByTestId("hasErrors").innerHTML).toEqual("0");
});

test("Test no $ref.", async () => {
    const {getByTestId} = render(<NoRefForm/>);
    await waitFor(() => getByTestId("firstName"));
    expect(getByTestId("firstName").value).toBe("Foo");
});

test("Test error when required field does not exist.", async () => {
    const {getByTestId} = render(<div data-testid="form"><RequiredFieldDoesNotExistForm/></div>);
    await waitFor(() => expect(getByTestId("form").innerHTML.toString()).toContain("The property <strong>flerberderb</strong> is set as required but it does not exist in the provided schema"));     // React18/Mobx6 needs this stronger wait
    expect(getByTestId("form").innerHTML.toString()).toContain("The property <strong>flerberderb</strong> is set as required but it does not exist in the provided schema");
});

test("Test error when a root dependency does not have a corresponding field in the schema.", async () => {
    const {getByTestId} = render(<div data-testid="form"><DependencyDoesNotExistForm/></div>);
    await waitFor(() => expect(getByTestId("form").innerHTML.toString()).toContain("The property <strong>flerberderb</strong> is referenced in dependencies but it does not exist in the provided schema"));     // React18/Mobx6 needs this stronger wait
    expect(getByTestId("form").innerHTML.toString()).toContain("The property <strong>flerberderb</strong> is referenced in dependencies but it does not exist in the provided schema");
});

test("Test error when a dependency contains a field that doesn't exist in the schema.", async () => {
    const {getByTestId} = render(<div data-testid="form"><DependencyDoesNotExist2Form/></div>);
    await waitFor(() => expect(getByTestId("form").innerHTML.toString()).toContain("The property <strong>flerberderb</strong> is referenced in dependencies but it does not exist in the provided schema"));     // React18/Mobx6 needs this stronger wait
    expect(getByTestId("form").innerHTML.toString()).toContain("The property <strong>flerberderb</strong> is referenced in dependencies but it does not exist in the provided schema");
});