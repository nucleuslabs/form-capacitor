import FormContext from './FormContext';
import { getValue, toPath } from './helpers';
import {useContext, useEffect, useState} from 'react';
import { pathToPatchString } from './validation';
import {autorun} from "mobx";

/**
 * Returns the stored value for the provided path in relation to the current FormContext path and a function to set the value
 * @param {string | string[]} path
 * @returns {[{any}, {func}]}
 */
export default function useTextField (path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    const patchPath = pathToPatchString(fullPath);
    const currValue = getValue(context.stateTree, fullPath, '');
    const [value, setValue] = useState(currValue);

    useEffect(() => {
        autorun(() => {
            setValue(getValue(context.stateTree, fullPath, ''));
        });
    // }, [context.stateTree[fullPath]]);
    }, []);     // Basically, we only setup the autorun once (see the empty dependency array), but it acts as the "effect" after that

    return [
        value,
        v => context.set(fullPath, v === '' ? undefined : v),
        context.fieldMetaDataMap && context.fieldMetaDataMap.has(patchPath) ? context.fieldMetaDataMap.get(patchPath) : { required: false }
    ];
};
