import FormContext from './FormContext';
import {toPath} from './helpers';
// import {useObserver} from "mobx-react-lite";
import {useContext, useEffect, useState} from "react";
import {getErrors} from "./errorMapping";
import {autorun} from "mobx";

/**
 * Returns an array of error objects for the provided path in relation to the current FormContext path
 * @param {string|string[]} path
 * @returns {[]}
 */
export default function useFieldErrors(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    // return useObserver(() => {
    //     const errors = getErrors(context.errorMap, fullPath);
    //     return [errors && errors.length > 0, errors];
    // });

    // React18/mobx6: useObserver() is deprecated, and tbqh, none of the API in mobx-react-lite looks like its meant for providing a custom hook in this manner.
    // Replaced with a custom hook leaning on useState, useEffect, and autorun() straight from mobx
    const currErrors = getErrors(context.errorMap, fullPath);
    const [errors, setErrors] = useState(currErrors);

    useEffect(() => {
        autorun(() => {
            setErrors(getErrors(context.errorMap, fullPath));
        });
    }, [context.errorMap[fullPath]]);

    return [errors && errors.length > 0, errors];
};