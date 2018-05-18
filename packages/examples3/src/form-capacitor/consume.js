import FormContext from './context';
import {getValue, setValue, toPath, resolveValue} from './util';
import {getDisplayName} from '../lib/react';

export default function consumeValue(options) {
    options = Object.assign({
        path: p => p.name,
        name: 'value',
    }, options)

    return Component => {
        const WrappedComponent = props => (
            <FormContext.Consumer>
                {({formData, path}) => {
                    const fullPath = [...path, ...toPath(resolveValue(options.path, props))];
                    const value = getValue(formData, fullPath);
                    // console.log(formData,fullPath,value);
                    const doSet = value => formData.set(fullPath, value);
                    return (
                        <FormContext.Provider value={{formData, path: fullPath}}>
                            {React.createElement(Component, {...props, [options.name]: value, setValue: doSet})}
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
