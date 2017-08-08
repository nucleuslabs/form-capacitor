import { compose,ComponentEnhancer} from 'recompose';
import {connect as connectRedux} from 'react-redux';
import namespace from '../namespace';
import ActionTypes from '../ActionTypes';
import {get as getValue} from 'lodash';
import {toPath} from 'lodash';
import {getPath,FIELD_PATH} from '../context';
import mountPoint from './mountPoint';
import {AnyObject, DispatchFn} from '../types/misc';
import withContext from './withContext';
import memoize from '../memoize';
import {defaultDeserialize,defaultSerialize} from '../util';

export interface ConnectOptions {
    nameProp?: string,
    valueProp?: string,
    dispatchProp?: string,
    deserializeValue?: (value: any) => any,
    serializeValue?: (value: any) => any,
}

export interface ConnectProps {
    name: string,
    value: any,
    dispatch: DispatchFn
}

export default function withValueDispatch<TProps=AnyObject>({
         nameProp = 'name',
         valueProp = 'value',
         dispatchProp = 'dispatch',
         deserializeValue = defaultDeserialize,
                                                                serializeValue = defaultSerialize,
     }: ConnectOptions = {}): ComponentEnhancer<TProps, TProps & ConnectProps> {
    
    return compose(
        withContext(),
        connectRedux((state, ownProps) => {
            const path = [namespace,...getPath(ownProps),...toPath(ownProps[nameProp])];
            // console.log('connnnect',path,ownProps[FIELD_PATH]);

            // FIXME: should pull default from schema? or undefined and schema HOC can set it after the fact
            const value = deserializeValue(getValue(state,path));
            
            console.log('value',value,getValue(state,path));
            
            // console.log('mapStateToProps',path,value);
            return {
                [valueProp]: value
            };
        }, dispatch => {
            const getDispatchProps = memoize((path,name) => {
                const fullPath: string[] = [...path,...toPath(name)];
                
                return {
                    [dispatchProp]: (value) => dispatch({type: ActionTypes.Change, payload: {
                        path: fullPath, 
                        value: serializeValue(value),
                    }}),
                };
            });
            
            return (_, ownProps: TProps) => getDispatchProps(getPath(ownProps), ownProps[nameProp]);
        }, (stateProps, dispatchProps, {[FIELD_PATH]: _1, [nameProp]: _2, ...ownProps}: {ownProps: TProps}) => {
            return {...stateProps, ...dispatchProps, ...ownProps}; 
        }),
        mountPoint(p => p[nameProp]),
    );
}
