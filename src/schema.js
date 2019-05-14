import {isArray, isMap, isObject, setValue} from './helpers';
import {observer} from 'mobx-react';
import {getDisplayName, scuChildren} from './react';
import $RefParser from 'json-schema-ref-parser'; // https://github.com/BigstickCarpet/json-schema-ref-parser/blob/master/docs/refs.md#getref
import jsonSchemaToMST from './jsonSchemaToMST';
import FormContext from './context';
import {watchForErrors} from './validation';
import stringToPath from "./stringToPath";
import * as React from "react";
import {isObservable, observable, toJS} from "mobx";

/* istanbul ignore next */
function getObservable(obj, path) {
    if(!obj) return undefined;
    if(!Array.isArray(path)) {
        path = stringToPath(path);
    }
    let ret = obj;

    for(let key of path) {
        if(isMap(ret)) {
            ret = ret.get(key);
        } else {
            ret = ret[key];
        }
    }

    return ret;
}

export default function schema(options) {
    options = Object.assign({
        schema: undefined,
        $ref: undefined,
        actions: undefined,
        views: undefined,
        default: undefined,
    }, options);

    const parser = new $RefParser();
    let schemaPromise = parser.dereference(options.schema);

    if(options.$ref) {
        schemaPromise = schemaPromise.then(() => parser.$refs.get(options.$ref));
    }

    return Component => {

        const WrappedComponent = class extends Component {

            constructor(props, context) {
                super(props, context);

                this.state = {
                    formData: null,
                    errorMap: null
                };
                schemaPromise.then(schema => {
                    let Model = jsonSchemaToMST(schema);

                    Model = Model.actions(self => ({
                        set(name, value) {
                            setValue(self, name, value);
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
                        }
                    }));
                    if(options.views) {
                        Model = Model.views(options.views);
                    }
                    if(options.actions) {
                        Model = Model.actions(options.actions);
                    }

                    const formData = Model.create(options.default);

                    const {errors, dispose, validate} = watchForErrors(schema, formData);

                    this.validate = () => {
                        validate(toJS(this.state.formData));
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

                        {React.createElement(observer(Component), {...this.state,...this.props, validate: this.validate})}
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