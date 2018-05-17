import FormContext from './context';
import {getValue,setValue, toPath, resolveValue} from './util';

export default function consumeValue(options) {
    options = Object.assign({
        path: p => p.name,
        name: 'value',
    }, options)
    
    return Component => props => (
        <FormContext.Consumer>
            {formData => {
                const path = toPath(resolveValue(options.path,props));
                const value = getValue(formData, path);
                const doSet = value => formData.set(path,value);
                return (
                    <FormContext.Provider value={value}>
                        {React.createElement(Component,{...props,[options.name]:value,setValue: doSet})}
                    </FormContext.Provider>
                )
            }}
        </FormContext.Consumer>
    )
}
