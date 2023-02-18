import FormContext from './FormContext';
import {getValue, toPath} from './helpers';
// import {useObserver} from "mobx-react-lite";
import {useContext, useEffect, useState} from "react";
import {pathToPatchString} from "./validation";
import {autorun} from "mobx";

/**
 * Returns the stored value for the provided path in relation to the current FormContext path and a function to set the value
 * @param {string | string[]} path
 * @returns {[{any}, {func}]}
 */
export default function useField(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    const patchPath = pathToPatchString(fullPath);
    // return useObserver(() => [
    //     getValue(context.stateTree, fullPath, undefined),
    //     v => context.set(fullPath, v),
    //     context.fieldMetaDataMap && context.fieldMetaDataMap.has(patchPath) ? context.fieldMetaDataMap.get(patchPath) : {required: false}
    // ]);

    // React18/mobx6: useObserver() is deprecated, and tbqh, none of the API in mobx-react-lite looks like its meant for providing a custom hook in this manner.
    // Replaced with a custom hook leaning on useState, useEffect, and autorun() straight from mobx
    const currValue = getValue(context.stateTree, fullPath, undefined);
    const [value, setValue] = useState(currValue);

    useEffect(() => {
        autorun(() => {
            setValue(getValue(context.stateTree, fullPath, undefined));
        });
    // }, [currValue]);
    }, [context.stateTree[fullPath]]);      // TODO: Both these dependencies pass all the tests. Not sure which I prefer

    return [
        value,
        v => context.set(fullPath, v),
        context.fieldMetaDataMap && context.fieldMetaDataMap.has(patchPath) ? context.fieldMetaDataMap.get(patchPath) : {required: false}
    ];
};