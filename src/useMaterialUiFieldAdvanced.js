import FormContext from './FormContext';
import {extractMuiProps, getValue, toPath} from './helpers';
import {useContext, useEffect, useState} from "react";
import {pathToPatchString} from "./validation";
import {getErrors} from "./errorMapping";
import {autorun} from "mobx";

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

    const [value, setValue] = useState(getValue(context.stateTree, fullPath, undefined));
    const [muiProps, setMuiProps] = useState(extractMuiProps(context, patchPath, getErrors(context.errorMap, fullPath)));

    useEffect(() => {
        autorun(() => {
            setValue(getValue(context.stateTree, fullPath, undefined));
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
        onChange
    };
};