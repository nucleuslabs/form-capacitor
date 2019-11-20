import React, {useState, useEffect} from 'react';
import {checkSchemaPathForErrors, createAjvObject, watchForPatches} from "./validation";
import jsonSchemaToMST from "./jsonSchemaToMST";
import {getObservable, isArray, isObject, isPlainObject, setValue} from "./helpers";
import stringToPath from "./stringToPath";
import SchemaAssignmentError from "./SchemaAssignmentError";
import {applySnapshot, getSnapshot} from "mobx-state-tree";
import SchemaDataReplaceError from "./SchemaDataReplaceError";
import {isObservable, observable, toJS} from "mobx";
import $RefParser from "json-schema-ref-parser";
import FormContext from './FormContext';

/**
 *
 * @param {function} FunctionalComponent
 * @param {{}} options
 * @returns {*[]}
 */

export default function useSchema(FunctionalComponent, options) {
    // const [schemaData, setSchemaData] = useState({});
    // const [errorMap, setErrorMap] = useState({});
    // const [imperativeValidate, setValidate] = useState(() => {
    //     return undefined;
    // });

    // const context = useLocalStore(() => ({
    //     _init: ({formData, errorMap, set, reset, validate, path}) => {
    //         if(!context.ready) {
    //             context.formData = formData;
    //             context.errorMap = errorMap;
    //             context.set = set;
    //             context.reset = reset;
    //             context.validate = validate;
    //             context.path = path;
    //             context.ready = true;
    //         }
    //     },
    //     formData: undefined,
    //     errorMap: undefined,
    //     set: undefined,
    //     reset: undefined,
    //     validate: undefined,
    //     path: [],
    //     ready: false,
    // }));
    let [context, setContext] = useState({
            ready: false,
    });

    // let [disposeEffect, setDisposeEffect] = useState(() => () => {} );

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
                let defaultSnapshot = {};
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
                    _afterDefaults() {
                        defaultSnapshot = getSnapshot(self);
                    },
                    _reset() {
                        applySnapshot(self, defaultSnapshot);
                    },
                    _replaceAll(value) {
                        applySnapshot(self, initialSnapshot);
                        this._setRoot(value);
                    },
                    _setRoot(value){
                        if(!isObject(value)) {
                            throw new Error("Replace must be passed a javascript object");
                        } else {
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
                    _splice(name, idx, deleteCount = 1, insert = undefined) {
                        if(insert !== undefined) {
                            getObservable(self, name).splice(idx, deleteCount, insert);
                        } else {
                            getObservable(self, name).splice(idx, deleteCount);
                        }
                    },
                    _slice(name, idx, length = 1) {
                        const arr = getObservable(self, name);
                        return arr.slice(idx, length);
                    }
                };
            });

            if(options.views) {
                Model = Model.views(options.views);
            }

            if(options.actions) {
                Model = Model.actions(options.actions);
            }

            const formData = Model.create();

            formData._afterCreate();

            if (options.default) {
                formData._setRoot(options.default);
            }

            formData._afterDefaults();

            const {errors, metaDataMap, validate} = watchForPatches(jsonSchema, formData, ajv);



            setContext({
                formData: formData,
                metaDataMap: metaDataMap,
                errorMap: errors,
                set: (path, value) => isPlainObject(path) ? formData._replaceAll({...path}) : formData._set(path, value),
                reset: formData._reset,
                validate: () => {
                    return validate(toJS(formData));
                },
                path: [],
                ready: true
            });
        });
    }, []);

    // FormContext.Provider({
    //     formData: schemaData,
    //     errorMap: errorMap,
    //     validate: imperativeValidate,
    //     path: [],
    // });
    if(context.ready){
        return <FormContext.Provider value={context}>
            <FunctionalComponent {...context}/>
        </FormContext.Provider>;
    } else {
        return <span/>;
    }
    // return [Provider(context), context];
}
