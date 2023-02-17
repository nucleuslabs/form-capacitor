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

    // TODO useObserver() is deprecated, and tbqh, none of the API in mobx-react-lite looks like its meant for providing a custom hook in this manner
    // After a zillion experiments with the API, including the useLocalObservable() hook, I'm getting nothing to work.
    // At this point I think we might need to back up to pure mobx and create a custom Reaction for our needs.
};