import {compose, ComponentEnhancer, withProps} from 'recompose';
// import {connect as connectRedux, Dispatch} from 'react-redux';
import namespace from '../namespace';
import ActionTypes from '../ActionTypes';
import {get as getValue, set as setValue} from 'lodash';
import {toPath} from 'lodash';
import {getPath,ContextPath,ContextStore} from '../context';
import mountPoint from './mountPoint';
import {AnyObject, DispatchFn} from '../types/misc';
import withContext from './withContext';
import memoize from '../memoize';
import {defaultDeserializeField,defaultSerialize} from '../util';
import withPath from './withPath';
import defaultStore from '../defaultStore';

export interface ConnectOptions {
    nameProp?: string,
    valueProp?: string,
    dispatchProp?: string,
    storeProp?: string,
    deserializeValue?: (value: any, props: any) => any,
    serializeValue?: (value: any, props: any) => any,
}

export interface ConnectProps {
    name: string,
    value: any,
    dispatch: DispatchFn
}

/**
 * @deprecated Use `withValue`
 */
export default function withValueDispatch<TProps=AnyObject>({
         nameProp = 'name',
         valueProp = 'value',
         dispatchProp = 'dispatch',
         deserializeValue = defaultDeserializeField,
         serializeValue = defaultSerialize,
     }: ConnectOptions = {}): ComponentEnhancer<TProps, TProps & ConnectProps> {
    
    return compose(
        withPath({nameProp}), 
        // connectRedux((state, ownProps) => {
        //     const fullPath = [namespace,...ownProps.path];
        //     // console.log('connnnect',path,ownProps[FIELD_PATH]);
        //    
        //     // console.log('conneccctt',ownProps);
        //
        //     // FIXME: should pull default from schema? or undefined and schema HOC can set it after the fact
        //     // deserializeValue isn't really needed either... can be done with withProps()
        //     const value = deserializeValue(getValue(state,fullPath), ownProps);
        //    
        //     // console.log(ownProps[nameProp],value,getValue(state,path));
        //    
        //     // console.log('mapStateToProps',path,value);
        //     return {
        //         [valueProp]: value
        //     };
        // }, (dispatch: Dispatch<any>, ownProps: TProps) => {
        //     // const fullPath: string[] = [...getPath(ownProps),...toPath(ownProps[nameProp])];
        //     // console.log(ownProps[FIELD_PATH],fullPath);
        //    
        //     return {
        //         [dispatchProp]: (value) => dispatch({type: ActionTypes.Change, payload: {
        //             path: ownProps.path,
        //             value: serializeValue(value, ownProps), // FIXME: is `serializeValue` *really* needed? this can be done in the eventHandler/dispatch call
        //         }}),
        //     };
        // }),
    );
}
