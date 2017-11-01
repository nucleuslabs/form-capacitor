import React from 'react';
import {createEagerFactory, wrapDisplayName, shallowEqual} from 'recompact';
import {ContextStore, StoreShape, ContextPath, PathShape, DATA_ROOT, defaultStore, DIRTY_ROOT, ContextDirty, DirtyShape, pubSub} from 'form-capacitor-store';
import {resolveValue, defaults, setValue} from 'form-capacitor-util/util';
import {get as getValue, toPath, unset} from 'lodash';

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
                [ContextPath]: PathShape,
                // [ContextStore]: StoreShape,
            };

            
            constructor(props, context) {
                super(props);

                const basePath = (context && context[ContextPath]) || [];
                const componentName = resolveValue(options.name, this.props);
                let componentPath = toPath(componentName);
                // fixme: should we assign a rand name?

                this.dataPath = [...basePath, ...componentPath];
            }

            componentWillMount() {
                const forceUpdate = () => this.forceUpdate();
                this.unsubs = [
                    pubSub.subscribe([DATA_ROOT, ...this.dataPath], forceUpdate),
                    pubSub.subscribe([DIRTY_ROOT, ...this.dataPath], forceUpdate),
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
                //     pubSub.get([DIRTY_ROOT, ...this.dataPath])
                // );
                const props = {
                    ...this.props,
                    [options.isDirtyProp]: !Object.is(pubSub.get([DATA_ROOT, ...this.dataPath]), pubSub.get([DIRTY_ROOT, ...this.dataPath]))
                };
                return factory(props);
            }
        }
    }
}