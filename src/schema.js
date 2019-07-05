import {isArray, isObject, resolveValue, setValue, getObservable} from './helpers';
import {observer} from 'mobx-react';
import {getDisplayName, scuChildren} from './react';
import $RefParser from 'json-schema-ref-parser'; // https://github.com/BigstickCarpet/json-schema-ref-parser/blob/master/docs/refs.md#getref
import jsonSchemaToMST from './jsonSchemaToMST';
import FormContext from './FormContext';
import {createAjvObject, checkSchemaPathForErrors, watchForErrors} from './validation';
import stringToPath from "./stringToPath";
import * as React from "react";
import {isObservable, observable, toJS} from "mobx";
import {getSnapshot, applySnapshot} from "mobx-state-tree";
import SchemaAssignmentError from "./SchemaAssignmentError";
import SchemaDataReplaceError from "./SchemaDataReplaceError";

/**
 * @deprecated use useSchema Hook instead
 * @param options
 * @returns {function(*=): {new(*=, *=): WrappedComponent, state, validate, _dispose: *, displayName: string, prototype: WrappedComponent}}
 */
export default function schema(options) {
    options = Object.assign({
        schema: undefined,
        $ref: undefined,
        actions: undefined,
        views: undefined,
        default: undefined,
    }, options);

    return Component => {

        const WrappedComponent = class extends Component {

            constructor(props, context) {
                super(props, context);

                const parser = new $RefParser();

                const schemaPromise = options.$ref ? parser.dereference(resolveValue(options.schema, props)).then(() => parser.$refs.get(options.$ref)) : parser.dereference(resolveValue(options.schema, props));

                this.state = {
                    formData: null,
                    errorMap: null
                };

                schemaPromise.then(schema => {
                    const ajv = createAjvObject();
                    let Model = jsonSchemaToMST(schema);
                    Model = Model.actions(self => {
                        let initialSnapshot = {};
                        return {
                            set(name, value) {
                                try {
                                    setValue(self, name, value);
                                } catch(err) {
                                    //
                                    const path = isArray(name) ? name : stringToPath(name);
                                    const validationErrors = checkSchemaPathForErrors(ajv, schema, path, value);
                                    throw new SchemaAssignmentError(err, "Could not assign a value in the form-capacitor schema", path, value, validationErrors);
                                }
                            },
                            _afterCreate() {
                                initialSnapshot = getSnapshot(self);
                            },
                            reset() {
                                applySnapshot(self, initialSnapshot);
                            },
                            replace(value) {
                                if(!isObject(value)) {
                                    throw new Error("Replace must be sent some form of javascript object");
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
                                        const validationErrors = checkSchemaPathForErrors(ajv, schema, path, value);
                                        throw new SchemaDataReplaceError(errs, "Error replacing some root form-capacitor props", propMap, validationErrors);
                                    }
                                }
                            },
                            _push(name, value) {
                                getObservable(self, name).push((isObject(value) || isArray(value)) && !isObservable(value) ? observable(value) : value);//toObservable(value));
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
                            _splice(name, idx, length = 1) {
                                getObservable(self, name).splice(idx, length);
                            }
                        };
                    });
                    if(options.views) {
                        Model = Model.views(options.views);
                    }
                    if(options.actions) {
                        Model = Model.actions(options.actions);
                    }

                    const formData = Model.create(resolveValue(options.default, props));

                    formData._afterCreate();

                    const {errors, dispose, validate} = watchForErrors(schema, formData, ajv);

                    this.validate = () => {
                        return validate(toJS(this.state.formData));
                    };
                    this._dispose = dispose;

                    this.setState({
                        formData,
                        errorMap: errors
                    });
                    // console.log(mst.create());
                    // console.log(mst);
                    // const defaultValue = resolveDefaultValue(schema);
                    // setValue(context[STORE_KEY], context[PATH_KEY], defaultValue)

                });
            }

            shouldComponentUpdate = scuChildren;

            componentWillUnmount() {
                if(this._dispose) {
                    // FIXME: what if the schema promise resolves after the component is unmounted..?
                    this._dispose();
                }
            }

            render() {
                return (
                    <FormContext.Provider value={{
                        formData: this.state.formData,
                        errorMap: this.state.errorMap,
                        path: [],
                    }}>

                        {React.createElement(observer(Component), {...this.state, ...this.props, validate: this.validate})}
                    </FormContext.Provider>
                )
            }
        };

        // WrappedComponent.contextTypes = {...CTX_TYPES, ...Component.contextTypes};

        if(process.env.NODE_ENV !== 'production') {
            const displayName = getDisplayName(Component);
            WrappedComponent.displayName = `@schema(${displayName})`;
        }

        return WrappedComponent;
    }
}