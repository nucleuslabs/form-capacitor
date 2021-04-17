import FormContext from './FormContext';
import {extractMuiProps, getValue, toPath} from './helpers';
import {useObserver} from "mobx-react-lite";
import {useContext} from "react";
import {pathToPatchString} from "./validation";
import {getErrors} from "./errorMapping";

/**
 * Returns the stored value for the provided path in relation to the current FormContext path and a function to set the value
 * @param {string | string[]} path
 * @returns {{}}
 */
export default function useMaterialUiArrayField(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    const patchPath = pathToPatchString(fullPath);
    const {_push, _pop, _splice, _clear, _replace, _remove} = context.stateTree;

    return useObserver(() => {
        return {
            muiProps: extractMuiProps(context, patchPath, getErrors(context.errorMap, fullPath)),
            value: getValue(context.stateTree, fullPath, []).slice(),
            set: v => context.set(fullPath, v),
            push: v => _push(fullPath, v),
            pop: () => _pop(fullPath),
            splice: (idx, length, insert) => _splice(fullPath, idx, length, insert),
            clear: () => _clear(fullPath),
            replace: arr => _replace(fullPath, arr),
            remove: (v) => _remove(fullPath, v)
        };
    });
};