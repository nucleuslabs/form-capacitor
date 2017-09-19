import {compose, ComponentEnhancer, mapProps, withProps} from 'recompose';
import {connect as connectRedux} from 'react-redux';
import namespace from '../namespace';
import ActionTypes from '../ActionTypes';
import getOr from 'lodash/fp/getOr';
import {toPath} from 'lodash';
import {getPath, ContextPath} from '../context';
import mountPoint from './mountPoint';
import {AnyObject, DispatchFn, MapFn} from '../types/misc';
import withContext from './withContext';
import memoize from '../memoize';
import withValueDispatch from './withValueDispatch';
import {ReactEventHandler} from 'react';
import withHandler, {EventHandler} from './withHandler';
import {defaultSerialize, defaultDeserializeField, resolveValue, identity, defaultDeserializeForm} from '../util';
import {get as getValue} from 'lodash';
import {bindActionCreators, Dispatch} from 'redux';
import withPath from './withPath';

export interface ConnectOptions {
    name: string|MapFn<TProps, string>
}

export interface ConnectProps {
    name: string,
    value: any,
    setField: DispatchFn
}

export default function form<TProps extends AnyObject=AnyObject>({
                                                    name: formName = p => p.name,
                                                    dataProp = 'data',
                                                    eventName = 'onSubmit',
                                                    eventHandler,
                                                    deserialize = defaultDeserializeForm,
                                                    setFieldProp = 'setField',
                                                }: {
    name?: string|MapFn<TProps, string>,
    eventName?: string,
    eventHandler?: EventHandler,
    deserialize?: (formData: any, ownProps: TProps) => any,
    dataProp?: string,
    setFieldProp?: string, // TODO: should we even let the user choose all these prop names? They can always use recompose.renameProps
} = {}): ComponentEnhancer<TProps, TProps & ConnectProps> {

    // TODO: formName should be random/unique (shortid) by default. This will let you put
    // many copies of the same form on the page without collisions. Name should be derived
    // from component name.
    
    let mapStateToProps = (state, ownProps: TProps) => {
        const path = [...getPath(ownProps),...toPath(resolveValue(formName, ownProps))];
        const formData = deserialize(getValue(state,path), ownProps);
        console.log('formData',formData);
        return {
            [dataProp]: formData
        };
    };
  
    let mergeProps = (stateProps, {setField}, ownProps) => {
        // console.log('mergeProps',stateProps, ownProps);
        
        let merged = {...ownProps, ...stateProps};
        
        if(setFieldProp) {
            merged[setFieldProp] = (name, value) => { // FIXME: the only difference between form and field is that the form takes in the name of a sub-field to mutate...but you can already do that because the entire subtree is already passed to you! just use lodash-fp's set
                if(typeof value === 'function') {
                    // console.log('currentValue',stateProps[dataProp],getValue(stateProps[dataProp], name));
                    if(!name || (Array.isArray(name) && !name.length)) {
                        value = value(stateProps[dataProp]);
                    } else {
                        value = value(getValue(stateProps[dataProp], name));
                    }
                    // console.log('after',value);
                    // value = 2;
                }


                const fullPath = [...ownProps.path, ...toPath(name)];
                // console.log('setting',fullPath,'to',value);
                setField({
                    type: ActionTypes.Change,
                    payload: {path: fullPath, value}
                });
            };
        }
        
        return merged;
    };

    let hocs = [
        withPath({name: formName}),
        connectRedux(mapStateToProps, null, mergeProps)
    ];
    
  

    if (eventHandler) {
        // FIXME: is this needed?? we could create a separate withSubmit() HOC which'd update the UI state to 'submitting' as well...
        hocs.push(withProps(ownProps => {
            return {
                [eventName]: ev => {
                    ev.preventDefault();
                    eventHandler(ownProps);
                }
            };
        }));
    }
    
    // hocs.push(mountPoint(formName));

    return compose(...hocs);
}
