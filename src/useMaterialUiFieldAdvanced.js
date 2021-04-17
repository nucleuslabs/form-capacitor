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
export default function useMaterialUiFieldAdvanced(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    const patchPath = pathToPatchString(fullPath);
    const onChange = (event) => {
        context.set(fullPath, event.target.value || undefined);
    };
    return useObserver(() => {
        return {
            muiProps: extractMuiProps(context, patchPath, getErrors(context.errorMap, fullPath)),
            value: getValue(context.stateTree, fullPath, undefined),
            set: v => context.set(fullPath, v),
            onChange
        };
    });
};