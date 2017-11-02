import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {CTX_KEY_PATH, CTX_VAL_PATH, DATA_ROOT, INIT_ROOT, pubSub} from 'form-capacitor-store';
import {resolveValue} from 'form-capacitor-util/util';
import {toPath} from 'lodash';

export default function withDirty(options) {

    options = {
        name: p => p.name,
        isDirtyProp: 'isDirty',
        ...options,
    };

    return BaseComponent => {
        const factory = createEagerFactory(BaseComponent);

        return class extends React.PureComponent {
            static displayName = wrapDisplayName(BaseComponent, 'withDirty');

            static contextTypes = {
                [CTX_KEY_PATH]: CTX_VAL_PATH,
                // [ContextStore]: StoreShape,
            };

            
            constructor(props, context) {
                super(props);

                const basePath = (context && context[CTX_KEY_PATH]) || [];
                const componentName = resolveValue(options.name, this.props);
                let componentPath = toPath(componentName);
                // fixme: should we assign a rand name?

                this.dataPath = [...basePath, ...componentPath];
                
                // console.log(this.dataPath.join('.'));
            }

            componentWillMount() {
                const forceUpdate = () => this.forceUpdate();
                this.unsubs = [
                    pubSub.subscribe([DATA_ROOT, ...this.dataPath], forceUpdate),
                    pubSub.subscribe([INIT_ROOT, ...this.dataPath], forceUpdate),
                ];
            }

            componentWillUnmount() {
                for(let unsub of this.unsubs) {
                    unsub();
                }
            }

            render() {
                // console.log('dirtyrender',
                //     pubSub.get([DATA_ROOT, ...this.dataPath]),
                //     pubSub.get([INIT_ROOT, ...this.dataPath])
                // );
                const props = {
                    ...this.props,
                    [options.isDirtyProp]: !Object.is(pubSub.get([DATA_ROOT, ...this.dataPath]), pubSub.get([INIT_ROOT, ...this.dataPath]))
                };
                return factory(props);
            }
        }
    }
}