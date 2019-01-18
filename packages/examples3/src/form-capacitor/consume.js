import FormContext from './context';
import {getValue, toPath, resolveValue} from './util';
import {getDisplayName} from '../lib/react';
import {isString,isNumber} from '../lib/types';
import {EMPTY_ARRAY, EMPTY_MAP} from '../lib/consts';
import {observer} from 'mobx-react';
import {computed, action, isObservableArray} from 'mobx';
import * as React from "react";

function getErrors(err, path) {
    for(let k of path) {
        if(isString(k)) {
            err = getValue(err,['properties',k]);
        } else if(isNumber(k)) {
            err = getValue(err,['items',k]);
        }
    }
    // console.log(err,path,err.toJS())
    return err;
}

export default function consumeValue(options) {
    options = Object.assign({
        path: p => p.name,
        name: 'value',
    }, options);

    return component => {
        const WrappedComponent = props => (
            <FormContext.Consumer>
                {context => React.createElement(observer(Consumed),{component,props,context,options})}
            </FormContext.Consumer>
        );

        if(process.env.NODE_ENV !== 'production') {
            WrappedComponent.displayName = `@consume(${getDisplayName(component)})`;
        }
        
        return WrappedComponent
    }
}

export function consumeArrayValue(options) {
    options = Object.assign({
        path: p => p.name,
        name: 'value',
    }, options);

    return component => {
        const WrappedComponent = props => (
            <FormContext.Consumer>
                {/*{context => <Consumed component={component} props={props} context={context} options={options}/>}*/}
                {context => React.createElement(observer(ConsumedArray),{component,props,context,options})}
            </FormContext.Consumer>
        );

        if(process.env.NODE_ENV !== 'production') {
            WrappedComponent.displayName = `@consume(${getDisplayName(component)})`;
        }

        return WrappedComponent
    }
}

/**
 * HOC which attaches to inputs that have a scalar or object value
 */
class Consumed extends React.Component {
    
    state = {
        path: EMPTY_ARRAY,
    };
    
    @computed get path() {
        const {props,context,options} = this.props;
        return [...context.path, ...toPath(resolveValue(options.path, props))]
    }
    
    @computed get value() {
        return getValue(this.props.context.formData, this.path)
    }

    @computed get errors() {
        return getErrors(this.props.context.errorMap, this.path) || EMPTY_MAP
    }
    
    @computed get setValue() {
        return v => this.props.context.formData.set(this.path,v)
    }

    render() {
        const {component,props,context,options} = this.props;
        // const {value,errors,path} = this.state;
        // console.log('rneder consume',getDisplayName(component));
        return (
            <FormContext.Provider value={{...context, path: this.path}}>
                {React.createElement(component, {...props, [options.name]: this.value, setValue: this.setValue, errors: this.errors})}
            </FormContext.Provider>
        )
    }
}

/**
 * HOC which attaches actions to a component so that it can access/modify the fc data in the context.
 * This is solely for components that access an ObservableArray as the underlying data structure.
 * The delta methods that can be used are simple and few: _push, _pop, _remove, _replace (setValue is the same as replace), _clear
 * If you want to add another Array mutation it needs to be added as an @action in the class below and passed into the
 * created component below in the actions menu and it must also be added to the actions attached to formData in the schema class in schema.js
 */
class ConsumedArray extends React.Component {

    state = {
        path: EMPTY_ARRAY,
    };

    @computed get path() {
        const {props,context,options} = this.props;
        return [...context.path, ...toPath(resolveValue(options.path, props))]
    }

    @computed get value() {
        return getValue(this.props.context.formData, this.path);
    }

    @computed get errors() {
        return getErrors(this.props.context.errorMap, this.path) || EMPTY_MAP
    }

    @action push() {
        return v => this.props.context.formData._push(this.path, v);
    }

    @action pop() {
        return () => this.props.context.formData._pop(this.path);
    }

    @action remove() {
        return v => this.props.context.formData._remove(this.path, v);
    }

    @action replace() {
        return v => this.props.context.formData._replace(this.path, v);
    }

    @action clear() {
        return () => {
            this.props.context.formData._clear(this.path);
        };
    }

    render() {
        const {component,props,context,options} = this.props;
        // const {value,errors,path} = this.state;
        // console.log('rneder consume',getDisplayName(component));
        return (
            <FormContext.Provider value={{...context, path: this.path}}>
                {React.createElement(component, {...props, [options.name]: isObservableArray(this.value) ? this.value.slice() : this.value, setValue: this.replace(), actions: {push: this.push(), pop: this.pop(), remove: this.remove(), replace: this.replace(), clear: this.clear()}, errors: this.errors})}
            </FormContext.Provider>
        )
    }
}