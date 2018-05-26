import FormContext from './context';
import {getValue, setValue, toPath, resolveValue, arrayEquals} from './util';
import {getDisplayName, scuChildren} from '../lib/react';
import {isString,isNumber} from '../lib/types';
import {EMPTY_ARRAY, EMPTY_MAP} from '../lib/consts';
import {observer} from 'mobx-react';

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

    static getDerivedStateFromProps(nextProps, prevState) {
        const {component,props,context,options} = nextProps;
        const path = [...context.path, ...toPath(resolveValue(options.path, props))];
        const value = getValue(context.formData, path);
        const errors = getErrors(context.errorMap,path) || EMPTY_MAP;
        const nextState = {value,errors};

        if(!arrayEquals(prevState.path, path)) {
            nextState.path = path;
            // nextState.setValue = v => context.formData.set(path,v);
        }

        return nextState
    }

    setValue = v => this.props.context.formData.set(this.state.path,v)
    
    render() {
        const {component,props,context,options} = this.props;
        const {value,errors,path} = this.state;
        return (
            <FormContext.Provider value={{...context, path: path}}>
                {React.createElement(observer(component), {...props, [options.name]: value, setValue: this.setValue, errors})}
            </FormContext.Provider>
        )
    }
}
