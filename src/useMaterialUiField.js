import FormContext from './FormContext';
import {toPath} from './helpers';
import {useObserver} from "mobx-react-lite";
import React, {useContext} from "react";
import {pathToPatchString} from "./validation";
import {getErrors} from "./errorMapping";

/**
 * Returns the stored value for the provided path in relation to the current FormContext path and a function to set the value
 * @todo build tests for me I am not covered!!!
 * @param {string | string[]} path
 * @returns {{}}
 */
export default function useMaterialUiField(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    const patchPath = pathToPatchString(fullPath);
    //transform meta data into material ui

    return useObserver(() => {
        const {title: label, ...metaData} = context.fieldMetaDataMap && context.fieldMetaDataMap.has(patchPath) ? context.fieldMetaDataMap.get(patchPath) : {required: false};
        const errors = getErrors(context.errorMap, fullPath);
        if(errors.length > 0) {
            const FormHelperTextProps = {
                children: <div>{errors.map((er, eIdx) => <div key={eIdx}>e.message</div>)}</div>
            };
            return {label, FormHelperTextProps, error: true, ...metaData};
        } else {
            return {label, ...metaData};
        }
    });
};