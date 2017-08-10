import {ComponentEnhancer, withContext, getContext, mapProps, compose} from 'recompose';
import {connect} from 'react-redux';
import {toPath} from 'lodash';
import {contextTypes, getPath, ContextPath, ContextType} from '../context';
import {AnyObject, MapFn} from '../types/misc';
import {resolveValue} from '../util'
import {InferableComponentEnhancerWithProps} from 'recompose';


export default function withPath<TProps=AnyObject>({nameProp = 'name', name = p => p[nameProp], destProp = 'path', push = true}) {
    let hocs = [
        getContext(contextTypes),
        mapProps(({[ContextPath]: basePath, ...props}) => {
            // console.log('withpath',[...toPath(basePath), ...toPath(resolveValue(name, props))]);
            return {...props, [destProp]: [...toPath(basePath), ...toPath(resolveValue(name, props))]};
        }),
    ];

    if (push) {
        hocs.push(withContext(contextTypes, p => ({[ContextPath]: p[destProp]})));
    }

    return compose(...hocs);
}