import FormContext from './context';
import {getValue, setValue, toPath, resolveValue, arrayEquals} from './util';
import {getDisplayName, scuChildren} from '../lib/react';
import {isString,isNumber} from '../lib/types';
import {EMPTY_ARRAY, EMPTY_MAP} from '../lib/consts';
import {observer} from 'mobx-react';
import {computed} from 'mobx';

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

    return component => {
        const WrappedComponent = props => (
            <FormContext.Consumer>
                {/*{context => <Consumed component={component} props={props} context={context} options={options}/>}*/}
                {context => React.createElement(observer(Consumed),{component,props,context,options})}
            </FormContext.Consumer>
        )

        if(process.env.NODE_ENV !== 'production') {
            WrappedComponent.displayName = `@consume(${getDisplayName(component)})`;
        }
        
        return WrappedComponent
    }
}


class Consumed extends React.Component {
    
    state = {
        path: EMPTY_ARRAY,
    }
    
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