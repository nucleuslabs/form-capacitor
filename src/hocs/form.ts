import {compose, ComponentEnhancer, mapProps, withProps} from 'recompose';
import {connect as connectRedux} from 'react-redux';
import namespace from '../namespace';
import ActionTypes from '../ActionTypes';
import getOr from 'lodash/fp/getOr';
import {toPath} from 'lodash';
import {getPath, FIELD_PATH} from '../context';
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

export interface ConnectOptions {
    name: string|MapFn<TProps, string>
}

export interface ConnectProps {
    name: string,
    value: any,
    dispatch: DispatchFn
}

export default function form<TProps extends AnyObject=AnyObject>({
                                                    name: formName = p => p.name,
                                                    dataProp = 'data',
                                                    eventName = 'onSubmit',
                                                    eventHandler,
                                                    deserialize = defaultDeserializeForm,
                                                    dispatchProp,
                                                }: {
    name?: string|MapFn<TProps, string>,
    eventName?: string,
    eventHandler?: EventHandler,
    deserialize?: (formData: any, ownProps: TProps) => any,
    dataProp?: string,
    dispatchProp?: string,
} = {}): ComponentEnhancer<TProps, TProps & ConnectProps> {

    // TODO: formName should be random/unique (shortid) by default. This will let you put
    // many copies of the same form on the page without collisions. Name should be derived
    // from component name.
    
    let mapStateToProps = (state, ownProps: TProps) => {
        const path = [namespace,...getPath(ownProps),...toPath(resolveValue(formName, ownProps))];
        const formData = deserialize(getValue(state,path), ownProps);
        return {
            [dataProp]: formData
        };
    };
    
    let mapDispatchToProps = {};
    
    if(dispatchProp) {
        mapDispatchToProps = (dispatch: Dispatch<any>, ownProps: TProps) => bindActionCreators({
            [dispatchProp]: (name, value) => {
                const path = [namespace,...getPath(ownProps),...toPath(resolveValue(formName, ownProps)), ...toPath(name)];
                return {
                    type: ActionTypes.Change,
                    payload: {path,value}
                }
            }
        }, dispatch)
    }
    
    let mergeProps = (stateProps, dispatchProps, ownProps: TProps) => {
        const {...props} = ownProps;
        delete props[FIELD_PATH];
        return {...stateProps, ...dispatchProps, ...props};
    };

    let hocs = [
        connectRedux(mapStateToProps, mapDispatchToProps, mergeProps)
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
    
    hocs.push(mountPoint(formName));

    return compose(...hocs);
}
