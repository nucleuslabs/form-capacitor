import {withProps, mapProps, getContext, withContext} from 'recompose';
import {compose, InferableComponentEnhancerWithProps, shallowEqual} from 'recompose';
import {connect} from 'react-redux';
import namespace from '../namespace';
import ActionTypes from '../ActionTypes';
import getOr from 'lodash/fp/getOr';
import toPath from 'lodash/toPath';
import {contextTypes,getPath,FIELD_PATH} from '../context';
import {bindActionCreators} from 'redux';

export interface ConnectOptions {
    nameProp?: string,
    valueProp?: string,
    dispatchProp?: string,
}


export default function connectField({
         nameProp = 'name',
         valueProp = 'value',
         dispatchProp = 'dispatch'
     }: ConnectOptions) {
    
    return compose(
        getContext(contextTypes),
        connect((state, ownProps) => {
            const path = [namespace,...getPath(ownProps),...toPath(ownProps[nameProp])];
            // console.log('connnnect',path,ownProps[FIELD_PATH]);
            const value = getOr(''/*FIXME: should pull default from schema? or undefined and schema HOC can set it after the fact*/, path, state);
            // console.log('mapStateToProps',path,value);
            return {
                [valueProp]: value
            };
        }, (dispatch,ownProps) => {
            const path = [...getPath(ownProps),...toPath(ownProps[nameProp])];
           
            const dispatchProps = {
                [dispatchProp]: value => dispatch({type: ActionTypes.Change, payload: {path, value}}),
            };
            
            return () => dispatchProps;
        }, (stateProps, dispatchProps, {[FIELD_PATH]: _, ...ownProps}) => {
            return {...stateProps, ...dispatchProps, ...ownProps}; 
        }),
        withContext(contextTypes, ownProps => {
            // FIXME: this is causing siblings to re-render...
            const path = [...getPath(ownProps),...toPath(ownProps[nameProp])];
            return {[FIELD_PATH]: path};

        }),
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