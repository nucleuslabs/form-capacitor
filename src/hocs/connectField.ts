import { compose,ComponentEnhancer} from 'recompose';
import {connect as connectRedux} from 'react-redux';
import namespace from '../namespace';
import ActionTypes from '../ActionTypes';
import getOr from 'lodash/fp/getOr';
import {toPath} from 'lodash';
import {getPath,FIELD_PATH} from '../context';
import mountPoint from './mountPoint';
import {AnyObject, DispatchFn} from '../types/misc';
import withContext from './withContext';
import memoize from '../memoize';

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
        withContext(),
        connectRedux((state, ownProps: TProps) => {
            const path = [namespace,...getPath(ownProps),...toPath(ownProps[nameProp])];
            // console.log('connnnect',path,ownProps[FIELD_PATH]);
            const value = getOr(''/*FIXME: should pull default from schema? or undefined and schema HOC can set it after the fact*/, path, state);
            // console.log('mapStateToProps',path,value);
            return {
                [valueProp]: value
            };
        }, () => {
            const getDispatchProps = memoize((dispatch,path,name) => {
                const fullPath: string[] = [...path,...toPath(name)];
                
                return {
                    [dispatchProp]: (value: any) => dispatch({type: ActionTypes.Change, payload: {path: fullPath, value}}),
                };
            });
            
            return (dispatch, ownProps: TProps) => getDispatchProps(dispatch, getPath(ownProps), ownProps[nameProp]);
        }, (stateProps, dispatchProps, {[FIELD_PATH]: _, [nameProp]: _, ...ownProps}) => {
            return {...stateProps, ...dispatchProps, ...ownProps}; 
        }),
        mountPoint(p => p[nameProp]),
    );
}
