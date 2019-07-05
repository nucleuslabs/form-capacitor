import FormContext from './FormContext';
import {getValue, toPath} from './helpers';
import {useObserver} from "mobx-react-lite";
import {useContext} from "react";

/**
 * Returns the stored value for this component and a function to set the value
 * @param {string | string[]} path
 * @returns {[{any}, {func}]}
 */
export default function useConsume(path) {
    const context = useContext(FormContext);
    const fullPath = [...context.path, ...toPath(path)];
    return useObserver(() => [getValue(context.formData, fullPath), v => context.set(fullPath,v)]);
};