import FormContext from './FormContext';
import {getValue, toPath} from './helpers';
import {useObserver} from "mobx-react-lite";
import {useContext} from "react";
import {pathToPatchString} from "./validation";
import {getErrors} from "./errorMapping";

/**
 * Returns the stored value for the provided path in relation to the current FormContext path and a function to set the value
 * @param {string | string[]} path
 * @returns {{}}
 */
export default function useMaterialUiField(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    const patchPath = pathToPatchString(fullPath);
    const onChange = (event) => {
        context.set(fullPath, event.target.value || undefined);
    };
    //transform meta data into material ui

    return useObserver(() => {
        const {title, label, helperText, required} = context.fieldMetaDataMap && context.fieldMetaDataMap.has(patchPath) ? context.fieldMetaDataMap.get(patchPath) : {required: false};
        const forRealsLabel = label || title;
        const value = getValue(context.stateTree, fullPath, undefined);
        const errors = getErrors(context.errorMap, fullPath);
        if(errors.length > 0) {
            const newHelperText = errors.length === 1 ? errors[0].message : errors.map((e) => e.message);
            return {label: forRealsLabel, value, helperText: newHelperText, required, onChange, error: true};
        } else {
            return {label: forRealsLabel, value, helperText, required, onChange};
        }
    });
};