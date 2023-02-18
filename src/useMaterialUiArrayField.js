import FormContext from './FormContext';
import {extractMuiProps, getValue, toPath} from './helpers';
// import {useObserver} from "mobx-react-lite";
import {useContext, useEffect, useState} from "react";
import {pathToPatchString} from "./validation";
import {getErrors} from "./errorMapping";
import {autorun} from "mobx";

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

    // return useObserver(() => {
    //     return {
    //         muiProps: extractMuiProps(context, patchPath, getErrors(context.errorMap, fullPath)),
    //         value: getValue(context.stateTree, fullPath, []).slice(),
    //         set: v => context.set(fullPath, v),
    //         push: v => _push(fullPath, v),
    //         pop: () => _pop(fullPath),
    //         splice: (idx, length, insert) => _splice(fullPath, idx, length, insert),
    //         clear: () => _clear(fullPath),
    //         replace: arr => _replace(fullPath, arr),
    //         remove: (v) => _remove(fullPath, v)
    //     };
    // });

    // React18/mobx6: useObserver() is deprecated, and tbqh, none of the API in mobx-react-lite looks like its meant for providing a custom hook in this manner.
    // Replaced with a custom hook leaning on useState, useEffect, and autorun() straight from mobx
    const [value, setValue] = useState(getValue(context.stateTree, fullPath, []).slice());
    const [muiProps, setMuiProps] = useState(extractMuiProps(context, patchPath, getErrors(context.errorMap, fullPath)));

    useEffect(() => {
        autorun(() => {
            setValue(getValue(context.stateTree, fullPath, []).slice());
        });
    }, [context.stateTree[fullPath]]);

    useEffect(() => {
        autorun(() => {
            setMuiProps(extractMuiProps(context, patchPath, getErrors(context.errorMap, fullPath)));
        });
    }, [context.fieldMetaDataMap[patchPath]]);

    return {
        muiProps: muiProps,
        value: value,
        set: v => context.set(fullPath, v),
        push: v => _push(fullPath, v),
        pop: () => _pop(fullPath),
        splice: (idx, length, insert) => _splice(fullPath, idx, length, insert),
        clear: () => _clear(fullPath),
        replace: arr => _replace(fullPath, arr),
        remove: (v) => _remove(fullPath, v)
    };
};