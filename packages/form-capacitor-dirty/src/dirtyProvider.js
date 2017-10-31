import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {defaultStore, pubSub} from 'form-capacitor-store';

export default function dirtyProvider(options) {
    options = {
          
        resetStateProp: undefined,
        markCleanProp: undefined,
        ...options,
    };

    return BaseComponent => {
        const factory = createEagerFactory(BaseComponent);
        
        return class extends React.PureComponent {
            static displayName = wrapDisplayName(BaseComponent, 'dirtyProvider');

            constructor(props) {

            }

            render() {
                return factory();
            }
        }
    }
}