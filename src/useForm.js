import React, {useState, useEffect, useContext} from 'react';
import {checkSchemaPathForErrors, createAjvObject, watchForPatches} from "./validation";
import jsonSchemaToMST from "./jsonSchemaToMST";
import {getObservable, getValue, isArrayLike, isObject, isPlainObject, setValue, toPath} from "./helpers";
import stringToPath from "./stringToPath";
import SchemaAssignmentError from "./SchemaAssignmentError";
import {applySnapshot, getSnapshot} from "mobx-state-tree";
import SchemaDataReplaceError from "./SchemaDataReplaceError";
import {isObservable, observable, computed, extendObservable, toJS} from "mobx";
import $RefParser from "json-schema-ref-parser";
import mobxTreeToSimplifiedObjectTree from "./mobxTreeToSimplifiedObjectTree";
import equal from 'fast-deep-equal';
import FormContext from "./FormContext";

/**
 * returns a form component wired up with state, field meta data, validation, and errors
 * @param {{}} options
 * @param {*} ObserverWrappedComponent
 * @returns {*}
 */
export default function useForm(options, ObserverWrappedComponent) {
    const [schemaContext, setContext] = useState({
        ready: false,
    });
    const {skipStateTreeSanitizer} = options;
    useEffect(() => {
        const parser = new $RefParser();
        const schemaPromise = options.$ref ? parser.dereference(options.schema).then(() => parser.$refs.get(options.$ref)) : parser.dereference(options.schema);
        schemaPromise.then(jsonSchema => {
            const ajv = createAjvObject();
            let Model = jsonSchemaToMST(jsonSchema);
            const formStatus = observable.object({ready: false, isDirty: false, isChanged: false});
            const changedSet = new Set();
            const dirtySet = new Set();

            // console.log("FULL SCHEMA");
            // console.log(JSON.stringify(jsonSchema));

            Model = Model.actions(self => {
                let initialSnapshot = {};
                let defaultSnapshot = {};
                return {
                    _setIsDirty(name){
                        dirtySet.add(toPath(name).join("."));
                        if(formStatus.isDirty !== true) {
                            formStatus.isDirty = true;
                        }
                    },
                    _clearIsDirty(){
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
                    _resetChangedState(){
                        changedSet.clear();
                        self._updateIsChanged(false);
                    },
                    _checkFieldAfterChange(name){
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
                        } catch(err) {
                            const path = isArrayLike(name) ? name : stringToPath(name);
                            const validationErrors = isObject(jsonSchema) ? checkSchemaPathForErrors(ajv, jsonSchema, path, value) : [];
                            throw new SchemaAssignmentError(err, `Could not assign a value in the form-capacitor schema for path: ${path.join(".")}`, path, value, validationErrors);
                        }
                        self._checkFieldAfterChange(name);
                        self._setIsDirty(name);
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
                    _reset() {
                        applySnapshot(self, defaultSnapshot);
                        self._resetChangedState();
                        self._clearIsDirty();
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
                                self._setIsDirty(prop);
                            });
                            if(errs.length > 0) {
                                const errProps = Array.from(propMap.keys()).join(", ");
                                throw new SchemaDataReplaceError(errs, `Error replacing some root form-capacitor props (${errProps})`, propMap);
                            }
                        }
                    },
                    _push(name, value) {
                        getObservable(self, name).push(((isObject(value) || isArrayLike(value)) && !isObservable(value)) ? observable(value) : value);//toObservable(value));
                        self._setIsDirty(name);
                    },
                    _pop(name) {
                        getObservable(self, name).pop();
                        self._setIsDirty(name);
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
                        return skipStateTreeSanitizer ? toJS(self): mobxTreeToSimplifiedObjectTree(self);
                    },
                    toJSON() {
                        return JSON.stringify(self.toJS());
                    }
                };
            });

            if(options.views) {
                Model = Model.views(options.views);
            }

            if(options.actions) {
                Model = Model.actions(options.actions);
            }

            const stateTreeInstance = Model.create();

            stateTreeInstance._afterCreate();

            if(options.default) {
                stateTreeInstance._setRoot(options.default);
            }

            stateTreeInstance._afterDefaults();

            const {errors, fieldMetaDataMap, validate} = watchForPatches(jsonSchema, stateTreeInstance, ajv, {...options});

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
                reset: stateTreeInstance._reset,
                validate: () => {
                    return skipStateTreeSanitizer ? toJS(stateTreeInstance) : validate(mobxTreeToSimplifiedObjectTree(stateTreeInstance));
                },
                path: [],
                ready: true
            });
        });
    }, []);
    const Schema = () => {
        const context = useContext(FormContext);
        return context.ready ? <ObserverWrappedComponent {...context}/> : (options.Loader || <div>Loading...</div>);
    };
    return <FormContext.Provider value={schemaContext}>
        <Schema/>
    </FormContext.Provider>;
}