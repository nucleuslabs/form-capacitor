import FormContext from './FormContext';
import {useObserver} from "mobx-react-lite";
import {useContext} from "react";
import {getErrorNode} from "./errorMapping";
import {toPath} from "./helpers";

/**
 * Returns an array containing a boolean if there is errors for this errorMap and the observable ErrorMap node for the current context.path combined with the provided path
 * @param {string | string[]} [path]
 * @returns {[boolean, Map]}
 */
export default function useErrorMap(path = []) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    return useObserver(() => {
        const errorMap = getErrorNode(context.errorMap, fullPath);
        return [errorMap && errorMap.size > 0, errorMap];
    });
};