import FormContext from './FormContext';
import {toPath} from './helpers';
import {useObserver} from "mobx-react-lite";
import {useContext} from "react";
import {getErrors} from "./errorMapping";

/**
 * @param {string|string[]} path
 * @returns {[]}
 */
export default function useConsumeErrors(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    // console.log(fullPath, context.errorMap, errors);
    return useObserver(() => {
        const errors = getErrors(context.errorMap, fullPath);
        return [errors && errors.length > 0, errors];
    });
};