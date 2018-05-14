import {resolveValue, setValue, toPath, getValue, toObservable} from './util';
import {observer} from 'mobx-react';
import {
    observable,
    action,
    runInAction,
    isObservable,
    extendObservable,
    observe as addObserve,
    toJS,
    isBoxedObservable
} from 'mobx';
import {STORE_KEY, PATH_KEY, CTX_TYPES} from './consts';
import {getDisplayName} from '../lib/react';
import $RefParser from 'json-schema-ref-parser'; // https://github.com/BigstickCarpet/json-schema-ref-parser/blob/master/docs/refs.md#getref


function unique(arr) {
    return Array.from(new Set(arr));
}

function keys(obj) {
    return obj ? Object.keys(obj) : [];
}

function resolveDefaultValue(schema) {
    if(!schema) throw new Error(`Missing schema`);
    if(schema.type === 'object') {
        const properties = unique([...keys(schema.properties), ...schema.required]);
        const required = schema.required ? new Set(schema.required) : new Set;
        const defaultValue = Object.create(null);
        for(let p of properties) {
            if(required.has(p)) {
                defaultValue[p] = resolveDefaultValue(schema.properties[p]);
            } else {
                defaultValue[p] = undefined;
            }
        }
        if(Object.hasOwnProperty.call(schema,'default')) {
            Object.assign(defaultValue, schema.default);
        }
        return defaultValue;
    }
    if(Object.hasOwnProperty.call(schema,'default')) {
        return schema.default;
    }
    switch(schema.type) {
        case 'array':
            return [];
        case 'string':
            return '';
        case 'boolean':
            return false;
        case 'null':
            return null;
        case 'integer':
        case 'number':
            return 0;
    }
    throw new Error(`Unsupported JSON Schema type "${schema.type}"`);
}

export default function schema(options) {
    options = Object.assign({
        schema: undefined,
        $ref: undefined,
    }, options)

    const parser = new $RefParser();
    let schemaPromise = parser.dereference(options.schema);

    if(options.$ref) {
        schemaPromise = schemaPromise.then(() => parser.$refs.get(options.$ref));
    }

    return Component => {
        
        

        
        // let schemaPromise = $RefParser.resolve(options.schema)
        //    
        // if(options.$ref) {
        //     schemaPromise = schemaPromise.then($refs => $refs.get(options.$ref));
        // }
        //
        // schemaPromise = schemaPromise.then(schema => $RefParser.dereference(schema));
        // // schemaPromise = schemaPromise.then($refs => $refs.get(options.$ref));
        // schemaPromise.then(schema => console.log('defaultValue',resolveDefaultValue(schema)));
        
        const WrappedComponent = class extends Component {


            constructor(props, context) {
                super(props, context);
                
                // import $RefParser from 'json-schema-ref-parser'; // https://github.com/BigstickCarpet/json-schema-ref-parser/blob/master/docs/refs.md#getref

                // const store = getValue(context[STORE_KEY], context[PATH_KEY])


                schemaPromise.then(action(schema => {
                    const defaultValue = resolveDefaultValue(schema);
                    setValue(context[STORE_KEY], context[PATH_KEY], defaultValue)
                }));
                
                
                
                // runInAction(() => setValue(context[STORE_KEY], this._path, value));
                // console.log(store.set);

                
                // console.log(props,context,options,store);
            }


            // render() {
            //     return React.createElement(Component, this.props);
            // }
            // render() {
            //     // console.log('rennddder', this._data.instructions[0]);
            //     let props;
            //     if(propName) {
            //         props = {...this.props, [propName]: this._data};
            //     } else {
            //         props = this.props;
            //     }
            //     return React.createElement(ObserverComponent, props);
            // }
        }

        WrappedComponent.contextTypes = {...CTX_TYPES, ...Component.contextTypes};

        if(process.env.NODE_ENV !== 'production') {
            const displayName = getDisplayName(Component);
            WrappedComponent.displayName = `@schema(${displayName})`;
        }

        return observer(WrappedComponent);
    }
}