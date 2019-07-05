import FormContext from './FormContext';
import {getValue, toPath} from './helpers';
import {useObserver} from "mobx-react-lite";
import {useContext} from "react";

/**
 * Returns an array containing the stored value for this component, a function to set the value and an object with a bunch of functions attached to it.
 * @param {string | string[]} path
 * @returns {[{any}, {function}, {push: function,pop: function, splice: function, clear: function, replace: function, remove: function}]}
 */
export default function useConsumeArray(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    const {_push, _pop, _splice, _clear, _replace, _remove} = context.formData;
    return useObserver(() => [
        getValue(context.formData, fullPath).slice(),
        v => context.set(fullPath, v),
        {
            push: v => _push(fullPath, v),
            pop: () => _pop(fullPath),
            splice: (idx, length) => _splice(fullPath, idx, length),
            slice: (idx, length) => _slice(fullPath, idx, length),
            clear: () => _clear(fullPath),
            replace: arr => _replace(fullPath, arr),
            remove: (v) => _remove(fullPath, v)
        }
    ]);
};