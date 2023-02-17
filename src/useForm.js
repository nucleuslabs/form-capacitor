import React, {useContext, useEffect, useState} from 'react';
import {createAjvObject, watchForPatches} from './validation';
import jsonSchemaToMST from './jsonSchemaToMST';
import {
    getObservable,
    getValue,
    isArrayLike,
    isFunction,
    isObject,
    isPlainObject,
    isPromise,
    PROJECT_NAME_VERSION,
    setValue,
    toPath
} from './helpers';
import stringToPath from './stringToPath';
import SchemaAssignmentError from './errorTypes/SchemaAssignmentError';
import {applySnapshot, getSnapshot} from 'mobx-state-tree';
import SchemaDataReplaceError from './errorTypes/SchemaDataReplaceError';
import {computed, extendObservable, observable, toJS} from 'mobx';
import $RefParser from 'json-schema-ref-parser';
import equal from 'fast-deep-equal';
import FormContext from './FormContext';
import {builtInDefaultSanitizer, builtInStateTreeSanitizer} from './sanitizers';
import InvalidDefaultError from './errorTypes/InvalidDefaultError';
import FormError from "./FormError";

async function setUpForm(options, sanitizers, setContext, setError){
    const {defaultSanitizer, validationSanitizer, outputSanitizer} = sanitizers;
    const parser = new $RefParser();
    const {$ref} = options;

    try {
        // const schemaPromise = $ref ? parser.dereference(options.schema).then(() => parser.$refs.get($ref)) : parser.dereference(options.schema);
        const jsonSchema = await($ref ? parser.dereference(options.schema).then(() => parser.$refs.get($ref)) : parser.dereference(options.schema));
        const ajv = createAjvObject();
        let Model;
        try {
            Model = jsonSchemaToMST(jsonSchema);
        } catch(err) {
            console.error(`${PROJECT_NAME_VERSION} An error occurred in the useForm hook while creating the mobx Type Model for the stateTree using options.schema${$ref ? ` for $ref: ${$ref}` : ''}. This could be a bug but it could also be an error in the json-schema, please check the schema for errors or unsupported features.`);
            throw err;
        }

        const formStatus = observable.object({
            ready: false,
            isDirty: false,
            isChanged: false,
            isSubmitting: false,
            isValidating: false,
            isFetching: false
        });
        const changedSet = new Set();
        const dirtySet = new Set();

        // console.log("FULL SCHEMA");
        // console.log(JSON.stringify(jsonSchema));
        Model = Model.actions(self => {
            let initialSnapshot = {};
            let defaultSnapshot = {};
            return {
                _setIsDirty(name) {
                    dirtySet.add(toPath(name).join("."));
                    if(formStatus.isDirty !== true) {
                        formStatus.isDirty = true;
                    }
                },
                _clearIsDirty() {
                    dirtySet.clear();
                    if(formStatus.isDirty !== false) {
                        formStatus.isDirty = false;
                    }
                },
                _updateIsChanged(changed) {
                    if(formStatus.isChanged !== changed) {
                        formStatus.isChanged = changed;
                    }
                },
                _isChanged(name) {
                    if(name !== undefined) {
                        return !equal(getValue(self, name), getValue(defaultSnapshot, name));
                    } else {
                        return !equal(self, defaultSnapshot);
                    }
                },
                _resetChangedState() {
                    changedSet.clear();
                    self._updateIsChanged(false);
                },
                _checkFieldAfterChange(name) {
                    //Check to see if data has changed and update the changedSet then set isChanged to true if changedSet has anything in it
                    if(self._isChanged(name)) {
                        changedSet.add(toPath(name).join("."));
                    } else {
                        changedSet.delete(toPath(name).join("."));
                    }
                    self._updateIsChanged(changedSet.size !== 0);
                },
                _set(name, value) {
                    try {
                        setValue(self, name, value);
                        self._checkFieldAfterChange(name);
                        self._setIsDirty(name);
                    } catch(err) {
                        const path = isArrayLike(name) ? name : stringToPath(name);
                        // const validationErrors = !isUndefined(jsonSchema) && !isNull(jsonSchema) && isObject(jsonSchema) ? checkSchemaPathForErrors(ajv, jsonSchema, path, value) : [];
                        throw new SchemaAssignmentError(err, `Could not assign a value in the form-capacitor schema for path: ${path.join(".")}`, path, value);
                    }
                },
                _afterCreate() {
                    initialSnapshot = getSnapshot(self);
                    self._clearIsDirty();
                },
                _afterDefaults() {
                    defaultSnapshot = getSnapshot(self);
                    self._resetChangedState();
                    self._clearIsDirty();
                },
                _reset(data) {
                    applySnapshot(self, defaultSnapshot);
                    self._resetChangedState();
                    if(data) {
                        self._setRoot(data);
                    }
                    self._clearIsDirty();
                },
                _replaceAll(value) {
                    applySnapshot(self, initialSnapshot);
                    this._setRoot(value);
                },
                _setRoot(value) {
                    if(!isObject(value)) {
                        throw new Error("Replace must be passed a javascript object");
                    } else {
                        const props = Object.keys(value);
                        const schemaAssignmentErrors = [];
                        props.forEach(prop => {
                            try {
                                setValue(self, prop, value[prop]);
                            } catch(err) {
                                schemaAssignmentErrors.push({prop, value: value[prop], error: err});
                            }
                            self._setIsDirty(prop);
                        });
                        if(schemaAssignmentErrors.length > 0) {
                            throw new SchemaDataReplaceError(schemaAssignmentErrors);
                        }
                    }
                },
                _push(name, value) {
                    // getObservable(self, name).push(((isObject(value) || isArrayLike(value)) && !isObservable(value)) ? observable(value) : value);//toObservable(value));
                    getObservable(self, name).push(value);                        // TODO: This is pushing non-observable objects into an observable array. The switch to React 18/mobx6/etc caused failures right here
                    self._setIsDirty(name);
                },
                _pop(name) {
                    const popped = getObservable(self, name).pop();
                    self._setIsDirty(name);
                    return popped;
                },
                _clear(name) {
                    getObservable(self, name).clear();
                    self._setIsDirty(name);
                },
                _replace(name, arr) {
                    getObservable(self, name).replace(arr);
                    self._setIsDirty(name);
                },
                _remove(name, value) {
                    getObservable(self, name).remove(value);
                    self._setIsDirty(name);
                },
                _splice(name, idx, deleteCount = 1, insert = undefined) {
                    if(insert !== undefined) {
                        getObservable(self, name).splice(idx, deleteCount, insert);
                    } else {
                        getObservable(self, name).splice(idx, deleteCount);
                    }
                    self._setIsDirty(name);
                },
                toJS() {
                    return outputSanitizer(toJS(self));
                },
                toJSON() {
                    return JSON.stringify(self.toJS());
                }
            };
        });

        //user defined views and actions
        if(options.views) {
            Model = Model.views(options.views);
        }
        if(options.actions) {
            Model = Model.actions(options.actions);
        }

        //prepare the stateTree and take a snapshot before applying defaults
        const stateTreeInstance = Model.create();
        stateTreeInstance._afterCreate();

        //apply defaults
        try {
            if(options.default) {
                if(isPromise(options.default)) {
                    stateTreeInstance._setRoot(defaultSanitizer(await options.default));
                } else if(isFunction(options.default)) {
                    stateTreeInstance._setRoot(defaultSanitizer(options.default()));
                } else {
                    stateTreeInstance._setRoot(defaultSanitizer(options.default));
                }
            }
        } catch(err) {
            /* istanbul ignore next */
            if(err instanceof SchemaDataReplaceError) {
                const errMessage = `${PROJECT_NAME_VERSION} had trouble setting defaults in useForm hook. Make sure the types in options.default match what is defined in options.schema.\n${err.schemaAssigmentErrors.map(sErr => {
                    const {prop, value, error: orgError} = sErr;
                    return `${PROJECT_NAME_VERSION} could not set [${prop}] to ${JSON.stringify(value)}\n ${orgError.toString()}`;
                })}`;
                console.error(errMessage);
                throw new InvalidDefaultError(errMessage);
            } else {//@todo ignoring these errors for coverage as we don't have a reliable way to break this enough to hit them yet
                /* istanbul ignore next */
                console.error(`${PROJECT_NAME_VERSION} could not initialize automated stateTree validation in useForm hook. This could be a bug or a schema error.`);
                /* istanbul ignore next */
                throw err;
            }
        }

        //take a snapshot of the tree after the defaults have been applied
        stateTreeInstance._afterDefaults();

        //enable automatic stateTree validation
        try {
            const {errors, fieldMetaDataMap, validate} = watchForPatches(jsonSchema, stateTreeInstance, ajv, {validationSanitizer});
            //Set formStatus Options
            extendObservable(
                formStatus,
                {
                    get hasErrors() {
                        return errors && errors.size > 0 && ((errors.has('children') && errors.get('children').size > 0) || (errors.has('errors') && errors.get('errors').size > 0));
                    },
                },
                {
                    hasErrors: computed
                }
            );
            formStatus.ready = true;
            setContext({
                stateTree: stateTreeInstance,
                status: formStatus,
                fieldMetaDataMap: fieldMetaDataMap,
                errorMap: errors,
                set: (path, value) => isPlainObject(path) ? stateTreeInstance._replaceAll({...path}) : stateTreeInstance._set(path, value),
                reset: (data, clearErrors = true) => {
                    stateTreeInstance._reset(data);
                    if(clearErrors) {
                        errors.clear();
                    }
                },
                validate: () => {
                    return validate(stateTreeInstance.toJS());
                },
                path: [],
                ready: true
            });
        } catch(err) {
            console.error(`${PROJECT_NAME_VERSION} could not initialize automated stateTree validation in useForm hook. This could be a bug or a schema error.`);
            console.error(err);
            throw err;
        }
    } catch(err) {
        setError(err);
    }
}
/**
 * returns a form component wired up with state, field meta data, validation, and errors
 * @param {{schema: {},$ref: string, defaults: {}, actions: {}, views: {},Loader: React.Component, treeSanitizer: function(tree: {}), defaultSanitizer: function(default: {}),ErrorComponent: React.Component}} options
 * @param {*} ObserverWrappedComponent
 * @returns {*}
 */
export default function useForm(options, ObserverWrappedComponent) {
    const [schemaContext, setContext] = useState({
        ready: false,
    });
    const [error, setError] = useState();
    options = Object.assign({
        treeSanitizer: builtInStateTreeSanitizer,
        defaultSanitizer: builtInDefaultSanitizer
    }, options);

    const ErrorComponent = options.ErrorComponent || FormError;

    //if this is not a function scream at whoever set it
    if(options.actions && !isFunction(options.actions)) {
        return <ErrorComponent
            message="options.actions must be a Function that takes in a mobx state tree and returns an object with a bunch of user defined methods (actions)."/>;
    }

    const {treeSanitizer, defaultSanitizer} = options;

    //the default tree sanitizer should work for most cases but for non JS backends or rest posts to controllers you may need some extra magic
    const validationSanitizer = options['validationSanitizer'] || treeSanitizer;
    const outputSanitizer = options['outputSanitizer'] || treeSanitizer;

    //if these are not functions scream at whoever set them to a !function
    if(!isFunction(treeSanitizer)) {
        return <ErrorComponent
            message="options.treeSanitizer must be a Function that takes a single POJO Tree as the only parameter and returns a sanitized POJO."/>;
    }
    if(!isFunction(defaultSanitizer)) {
        return <ErrorComponent
            message="options.defaultSanitizer must be a Function that takes a single POJO Tree as the only parameter and returns a sanitized POJO."/>;
    }
    if(!isFunction(validationSanitizer)) {
        return <ErrorComponent
            message="options.validationSanitizer must be a Function that takes a single POJO Tree as the only parameter and returns a sanitized POJO."/>;
    }
    if(!isFunction(outputSanitizer)) {
        return <ErrorComponent
            message="options.outputSanitizer must be a Function that takes a single POJO Tree as the only parameter and returns a sanitized POJO."/>;
    }

    useEffect(() => {
        setUpForm(options, {
            defaultSanitizer,
            validationSanitizer,
            outputSanitizer
        }, setContext, setError).catch(console.error);
    }, []);
    const Schema = () => {
        if(error) {
            // console.log(error);
            return <ErrorComponent message={error.message} error={error}/>;
        }
        const context = useContext(FormContext);
        return context.ready ? <ObserverWrappedComponent {...context}/> : (options.Loader || <div>Loading...</div>);
    };
    return <FormContext.Provider value={schemaContext}>
        <Schema/>
    </FormContext.Provider>;
}