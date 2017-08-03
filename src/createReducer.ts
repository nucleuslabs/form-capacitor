import ActionTypes from './ActionTypes';
import {Action} from './types/misc';
import setIn from 'lodash/fp/set';

export default function createReducer(initialState: {[k:string]:any} = {}) {
    return (state = initialState, action: Action) => {
        const {payload} = action;
        switch(action.type) {
            case ActionTypes.Change:
                state = setIn(payload.path, payload.value, state);
                break;
        }
        return state;
    }
}