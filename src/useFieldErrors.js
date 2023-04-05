import FormContext from './FormContext';
import {toPath} from './helpers';
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
    const currErrors = getErrors(context.errorMap, fullPath);
    const [errors, setErrors] = useState(currErrors);

    useEffect(() => {
        autorun(() => {
            setErrors(getErrors(context.errorMap, fullPath));
        });
    // }, [context.errorMap[fullPath]]);
    }, []);     // Basically, we only setup the autorun once (see the empty dependency array), but it acts as the "effect" after that

    return [errors && errors.length > 0, errors];
};
