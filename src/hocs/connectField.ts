import {
    withProps, mapProps, getContext, withContext, compose, InferableComponentEnhancerWithProps, shallowEqual,
    ComponentEnhancer
} from 'recompose';
import {connect as connectRedux} from 'react-redux';
import namespace from '../namespace';
import ActionTypes from '../ActionTypes';
import getOr from 'lodash/fp/getOr';
import {toPath} from 'lodash';
import {contextTypes,getPath,FIELD_PATH} from '../context';
import withRoot from './mountPoint';
import {AnyObject, DispatchFn} from '../types/misc';

export interface ConnectOptions {
    nameProp?: string,
    valueProp?: string,
    dispatchProp?: string,
}

export interface ConnectProps {
    name: string,
    value: any,
    dispatch: DispatchFn
}

export default function connectField<TProps=AnyObject>({
         nameProp = 'name',
         valueProp = 'value',
         dispatchProp = 'dispatch'
     }: ConnectOptions = {}): ComponentEnhancer<TProps, TProps & ConnectProps> {
    
    return compose(
        getContext(contextTypes),
        connectRedux((state, ownProps: TProps) => {
            const path = [namespace,...getPath(ownProps),...toPath(ownProps[nameProp])];
            // console.log('connnnect',path,ownProps[FIELD_PATH]);
            const value = getOr(''/*FIXME: should pull default from schema? or undefined and schema HOC can set it after the fact*/, path, state);
            // console.log('mapStateToProps',path,value);
            return {
                [valueProp]: value
            };
        }, (dispatch,ownProps: TProps) => {
            const path: string[] = [...getPath(ownProps),...toPath(ownProps[nameProp])];
           
            const dispatchProps = {
                [dispatchProp]: (value: any) => dispatch({type: ActionTypes.Change, payload: {path, value}}),
            };
            
            return () => dispatchProps;
        }, (stateProps, dispatchProps, {[FIELD_PATH]: _, ...ownProps}) => {
            return {...stateProps, ...dispatchProps, ...ownProps}; 
        }),
        withRoot(p => p[nameProp]),
    );
}

/**
 * 
 *  console.log('aaa');

 const path = [...getPath(ownProps),...toPath(name)];
 const dispatchProps = {
                [dispatchProp]: value => {
                    console.log('ccc',value,dispatch);
                    return dispatch({type: ActionTypes.Change, payload: {path, value}});
                }
            };

 return dispatch2 => {
                console.log('bbb',dispatch==dispatch2);
                return dispatchProps;
            }


 const dispatchProps = memoize((dispatch, basePath, name) => {
                const path = [...basePath,...toPath(name)];
                return {
                    [dispatchProp]: value => dispatch({type: ActionTypes.Change, payload: {path, value}})
                };
            });


 console.log('qqqq',nameProp,ownProps);


 return dispatch => dispatchProps(dispatch, getPath(ownProps), ownProps[nameProp]);
 
 */