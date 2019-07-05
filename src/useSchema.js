import React, {useState, useEffect} from 'react';
import {checkSchemaPathForErrors, createAjvObject, watchForErrors} from "./validation";
import jsonSchemaToMST from "./jsonSchemaToMST";
import {getObservable, isArray, isObject, isPlainObject, setValue} from "./helpers";
import stringToPath from "./stringToPath";
import SchemaAssignmentError from "./SchemaAssignmentError";
import {applySnapshot, getSnapshot} from "mobx-state-tree";
import SchemaDataReplaceError from "./SchemaDataReplaceError";
import {isObservable, observable, toJS} from "mobx";
import $RefParser from "json-schema-ref-parser";
import FormContext from "./FormContext";

function Provider(context) {
    return props => <FormContext.Provider value={context}>{props.children}</FormContext.Provider>;
}

/**
 *
 * @param options
 * @returns {*[]}
 */

export default function useSchema(options) {
    // const [schemaData, setSchemaData] = useState({});
    // const [errorMap, setErrorMap] = useState({});
    // const [imperativeValidate, setValidate] = useState(() => {
    //     return undefined;
    // });
    let [context, setContext] = useState({});
    let [disposeEffect, setDisposeEffect] = useState(() => () => null);

    useEffect(() => {
        options = Object.assign({
            schema: undefined,
            $ref: undefined,
            actions: undefined,
            views: undefined,
            default: undefined,
        }, options);

        const parser = new $RefParser();
        const schemaPromise = options.$ref ? parser.dereference(options.schema).then(() => parser.$refs.get(options.$ref)) : parser.dereference(options.schema);
        schemaPromise.then(jsonSchema => {
            const ajv = createAjvObject();
            let Model = jsonSchemaToMST(jsonSchema);
            Model = Model.actions(self => {
                let initialSnapshot = {};
                return {
                    _set(name, value) {
                        try {
                            setValue(self, name, value);
                        } catch(err) {
                            const path = isArray(name) ? name : stringToPath(name);
                            const validationErrors = checkSchemaPathForErrors(ajv, jsonSchema, path, value);
                            throw new SchemaAssignmentError(err, `Could not assign a value in the form-capacitor schema for path: ${path.join(".")}`, path, value, validationErrors);
                        }
                    },
                    _afterCreate() {
                        initialSnapshot = getSnapshot(self);
                    },
                    _reset() {
                        applySnapshot(self, initialSnapshot);
                    },
                    _replaceAll(value) {
                        if(!isObject(value)) {
                            throw new Error("Replace must be passed a javascript object");
                        } else {
                            applySnapshot(self, initialSnapshot);
                            const props = Object.keys(value);
                            let errs = [];
                            let propMap = new Map();
                            props.forEach(prop => {
                                try {
                                    setValue(self, prop, value[prop]);
                                } catch(err) {
                                    errs.push(err);
                                    propMap.set(prop, value);
                                }
                            });
                            if(errs.length > 0) {
                                const errProps = Array.from(propMap.keys()).join(", ");
                                throw new SchemaDataReplaceError(errs, `Error replacing some root form-capacitor props (${errProps})`, propMap);
                            }
                        }
                    },
                    _push(name, value) {
                        getObservable(self, name).push(((isObject(value) || isArray(value)) && !isObservable(value)) ? observable(value) : value);//toObservable(value));
                    },
                    _pop(name) {
                        getObservable(self, name).pop();
                    },
                    _clear(name) {
                        getObservable(self, name).clear();
                    },
                    _replace(name, arr) {
                        getObservable(self, name).replace(arr);
                    },
                    _remove(name, value) {
                        getObservable(self, name).remove(value);
                    },
                    _splice(name, idx, length = 1, insert = undefined) {
                        if(insert !== undefined) {
                            getObservable(self, name).splice(idx, length, insert);
                        } else {
                            getObservable(self, name).splice(idx, length);
                        }
                    },
                    _slice(name, idx, length = 1) {
                        getObservable(self, name).slice(idx, length);
                    }
                };
            });

            if(options.views) {
                Model = Model.views(options.views);
            }
            if(options.actions) {
                Model = Model.actions(options.actions);
            }

            const formData = Model.create(options.default);

            formData._afterCreate();

            const {errors, dispose, validate} = watchForErrors(jsonSchema, formData, ajv);

            // //set all the hooks
            // setSchemaData(formData);
            // setErrorMap(errors);
            // setValidate();
            setContext({
                formData: formData,
                errorMap: errors,
                ready: true,
                set: (path, value) => isPlainObject(path) ? formData._replaceAll({...path}) : formData._set(path, value),
                reset: () => formData._reset(),
                validate: () => {
                    return validate(toJS(formData));
                },
                path: [],
            });
            setDisposeEffect(dispose);
        });
        return disposeEffect;
    }, []);

    // FormContext.Provider({
    //     formData: schemaData,
    //     errorMap: errorMap,
    //     validate: imperativeValidate,
    //     path: [],
    // });

    return [Provider(context), context];
}
