import FormContext from './FormContext';
import {getValue, toPath} from './helpers';
import {useObserver} from "mobx-react-lite";
import {useContext} from "react";
import {pathToPatchString} from "./validation";

/**
 * Returns the stored value for this component and a function to set the value
 * @param {string | string[]} path
 * @returns {[{any}, {func}]}
 */
export default function useConsume(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    const patchPath = pathToPatchString(fullPath);
    // console.log("useConsume", fullPath, getValue(context.formData, fullPath));
    return useObserver(() => [getValue(context.formData, fullPath), v => context.set(fullPath, v), context.metaDataMap && context.metaDataMap.has(patchPath) ? context.metaDataMap.get(patchPath) : {required: false}]);
};