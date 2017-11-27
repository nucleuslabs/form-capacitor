import React from 'react';

/**
 * Perform a shallow equal to every prop that is not a React Element
 * This will return true for unchanged props (where the only changes are the react elements props like 'children')
 * @param {Object} thisProps
 * @param {Object} nextProps
 * @returns {Boolean}
 */
function shallowEqualProps(thisProps, nextProps) {
    let equals = false;
    if(thisProps === nextProps) {
        equals = true;
    } else if(typeof thisProps === 'object' && typeof nextProps === 'object') {
        equals = true;
        const propNames = new Set(Object.keys(thisProps), Object.keys(nextProps));
        for(const propName of propNames) {
            if(thisProps[propName] !== nextProps[propName] && !isReactElement(thisProps[propName])) {
                // No need to check nextProps[propName] as well, as we know they are not equal
                equals = false;
                break;
            }
        }
    }
    return equals;
}

/**
 * @param {Object} thisState
 * @param {Object} nextState
 * @returns {Boolean}
 */
function shallowEqualState(thisState, nextState) {
    return thisState === nextState
}

export function shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualState(this.state, nextState) || !shallowEqualProps(this.props, nextProps);
}

/**
 * If the provided argument is a valid react element or an array that contains at least
 * one valid react element in it
 * @param {*} suspectedElement
 * @returns {Boolean}
 */
function isReactElement(suspectedElement) {
    let isElem = false;
    if(React.isValidElement(suspectedElement)) {
        isElem = true;
    } else if(Array.isArray(suspectedElement)) {
        for(let i = 0, l = suspectedElement.length; i < l; i++) {
            if(React.isValidElement(suspectedElement[i])) {
                isElem = true;
                break;
            }
        }
    }
    return isElem;
}

export function useShallowEqual(WrappedComponent) {
    class ShallowEqualEnhancer extends WrappedComponent {
        static displayName = `ShallowEqualEnhanced${WrappedComponent.displayName || WrappedComponent.name || 'Component'}`;
        
        shouldComponentUpdate(nextProps, nextState) {
            let shouldUpdate = false;
            if(!super.shouldComponentUpdate || super.shouldComponentUpdate(nextProps, nextState)) {
                if(!shallowEqualState(this.state, nextState) || !shallowEqualProps(this.props, nextProps)) {
                    shouldUpdate = true;
                }
            }
            return shouldUpdate;
        }
    }

    return ShallowEqualEnhancer;
}