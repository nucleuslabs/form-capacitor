import { compose,ComponentEnhancer} from 'recompose';
import {connect as connectRedux, Dispatch} from 'react-redux';
import namespace from '../namespace';
import ActionTypes from '../ActionTypes';
import {get as getValue} from 'lodash';
import {toPath} from 'lodash';
import {getPath,FIELD_PATH} from '../context';
import mountPoint from './mountPoint';
import {AnyObject, DispatchFn} from '../types/misc';
import withContext from './withContext';
import memoize from '../memoize';
import {defaultDeserializeField,defaultSerialize} from '../util';

export interface ConnectOptions {
    nameProp?: string,
    valueProp?: string,
    dispatchProp?: string,
    deserializeValue?: (value: any, props: any) => any,
    serializeValue?: (value: any, props: any) => any,
    removeName?: boolean,
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
         deserializeValue = defaultDeserializeField,
         serializeValue = defaultSerialize,
        removeName = true,
     }: ConnectOptions = {}): ComponentEnhancer<TProps, TProps & ConnectProps> {
    
    return compose(
        withContext(),
        connectRedux((state, ownProps) => {
            const path = [namespace,...getPath(ownProps),...toPath(ownProps[nameProp])];
            // console.log('connnnect',path,ownProps[FIELD_PATH]);

            // FIXME: should pull default from schema? or undefined and schema HOC can set it after the fact
            const value = deserializeValue(getValue(state,path), ownProps);
            
            // console.log(ownProps[nameProp],value,getValue(state,path));
            
            // console.log('mapStateToProps',path,value);
            return {
                [valueProp]: value
            };
        }, (dispatch: Dispatch<any>, ownProps: TProps) => {
            const fullPath: string[] = [...getPath(ownProps),...toPath(ownProps[nameProp])];
            
            return {
                [dispatchProp]: (value) => dispatch({type: ActionTypes.Change, payload: {
                    path: fullPath,
                    value: serializeValue(value, ownProps), // FIXME: is `serializeValue` *really* needed? this can be done in the eventHandler/dispatch call
                }}),
            };
            
            
            // const getDispatchProps = memoize((path,name) => {
            //     const fullPath: string[] = [...path,...toPath(name)];
            //    
            //     return {
            //         [dispatchProp]: (value) => dispatch({type: ActionTypes.Change, payload: {
            //             path: fullPath, 
            //             value: serializeValue(value),
            //         }}),
            //     };
            // });
            //
            // return (_, ownProps: TProps) => getDispatchProps(getPath(ownProps), ownProps[nameProp]);
        }, (stateProps, dispatchProps, ownProps: TProps) => {
            const {...props} = ownProps;
            delete props[FIELD_PATH];
            if(removeName) {
                delete props[nameProp];
            }
            
            return {...stateProps, ...dispatchProps, ...props}; 
        }),
        mountPoint(p => p[nameProp]),
    );
}
