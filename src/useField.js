import FormContext from './FormContext';
import {getValue, toPath} from './helpers';
import {useObserver} from "mobx-react-lite";
import {useContext} from "react";
import {pathToPatchString} from "./validation";

/**
 * Returns the stored value for the provided path in relation to the current FormContext path and a function to set the value
 * @param {string | string[]} path
 * @returns {[{any}, {func}]}
 */
export default function useField(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    const patchPath = pathToPatchString(fullPath);
    return useObserver(() => [
        getValue(context.stateTree, fullPath, undefined),
        v => context.set(fullPath, v),
        context.fieldMetaDataMap && context.fieldMetaDataMap.has(patchPath) ? context.fieldMetaDataMap.get(patchPath) : {required: false}
    ]);
};