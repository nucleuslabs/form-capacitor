import FormContext from './context';
import {getValue, toPath, resolveValue, isString, isNumber, EMPTY_ARRAY, EMPTY_MAP} from './helpers';
import {getDisplayName} from './react';
import {observer} from 'mobx-react';
import {computed, action, isObservableArray, toJS, observable} from 'mobx';
import * as React from "react";

function getErrors(err, path) {
    for(let k of path) {
        if(isString(k)) {
            err = getValue(err,['properties',k]);
        } else if(isNumber(k)) {
            err = getValue(err,['items',k]);
        }
    }
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
                {context => React.createElement(Consumed,{component,props,context,options})}
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
                {context => React.createElement(ConsumedArray,{component,props,context,options})}
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
@observer
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
        // const errs = getErrors(this.props.context.errorMap, this.path);
        // console.warn(this.path);
        // console.warn(errs);
        return getErrors(this.props.context.errorMap, this.path) || []
    }

    @computed get hasErrors(){
        const errors = this.errors;
        return (errors && errors.length > 0);
    }

    @computed get set() {
        const {context} = this.props;
        return v => context.formData.set(this.path,v)
    }

    // @computed get hasErrors(){
    //     const errs = this.errors;
    //     return (errs && errs.size > 0);
    // }

    render() {
        const {component,props,context,options} = this.props;
        // const {value,errors,path} = this.state;
        // console.log('rneder consume',getDisplayName(component));
        return (
            <FormContext.Provider value={{...context, path: this.path}}>
                {React.createElement(component, {...props, [options.name]: this.value, fc: {set: this.set, hasErrors: this.hasErrors, errors: this.errors}})}
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
@observer
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
        return getErrors(this.props.context.errorMap, this.path) || EMPTY_ARRAY
    }

    @computed get hasErrors(){
        const errors = this.errors;
        return (errors && errors.length > 0);
    }

    @action push() {
        const {context} = this.props;
        // return v => context.formData._replace(this.path, [...this.value, new String(v)]);
        return v => context.formData._push(this.path, v);
    }

    @action pop() {
        const {context} = this.props;
        return () => context.formData._pop(this.path);
    }

    @action remove() {
        const {context} = this.props;
        return v => context.formData._remove(this.path, v);
    }

    @action replace() {
        const {context} = this.props;
        return v => context.formData._replace(this.path, v);
    }

    @action clear() {
        const {context} = this.props;
        return () => {
            context.formData._clear(this.path);
        };
    }

    render() {
        const {component,props,context,options} = this.props;
        // const {value,errors,path} = this.state;
        // console.log('rneder consume',getDisplayName(component));
        return (
            <FormContext.Provider value={{...context, path: this.path}}>
                {React.createElement(component, {...props, [options.name]: isObservableArray(this.value) ? this.value.slice() : this.value, fc: {set: this.replace(), push: this.push(), pop: this.pop(), remove: this.remove(), replace: this.replace(), clear: this.clear(), hasErrors: this.hasErrors, errors: this.errors}})}
            </FormContext.Provider>
        )
    }
}