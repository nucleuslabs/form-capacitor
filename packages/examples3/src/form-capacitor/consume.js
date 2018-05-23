import FormContext from './context';
import {getValue, setValue, toPath, resolveValue} from './util';
import {getDisplayName} from '../lib/react';
import {isString,isNumber} from '../lib/types';

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
    }, options)

    return Component => {
        const WrappedComponent = props => (
            <FormContext.Consumer>
                {({formData, errorMap, path}) => {
                    const fullPath = [...path, ...toPath(resolveValue(options.path, props))];
                    const value = getValue(formData, fullPath);
                    // console.log('i has an errormap?',errorMap,value);
                    const errors = getErrors(errorMap,fullPath) || new Map;
                    // console.log('errors',getErrors(errorMap,path));
                    // console.log(formData,fullPath,value);
                    const doSet = value => formData.set(fullPath, value);
                    return (
                        <FormContext.Provider value={{formData, errorMap, path: fullPath}}>
                            {React.createElement(Component, {...props, [options.name]: value, setValue: doSet, errors})}
                        </FormContext.Provider>
                    )
                }}
            </FormContext.Consumer>
        )

        if(process.env.NODE_ENV !== 'production') {
            const displayName = getDisplayName(Component);
            WrappedComponent.displayName = `@consumeValue(${displayName})`;
        }
        
        return WrappedComponent
    }


}
