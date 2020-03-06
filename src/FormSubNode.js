import FormContext from './FormContext';
import {toPath} from './helpers';
import React, {useContext} from "react";

/**
 * Used for nesting fields within a useForm context
 * @param {string| string[]} path
 * @param {*} children
 * @returns {*}
 * @constructor
 */
export default function FormSubNode({path, children}) {
    const {path: contextPath, ...context} = useContext(FormContext);
    return <FormContext.Provider value={Object.assign({path: [...contextPath, ...toPath(path)]}, context)}>
        {children}
    </FormContext.Provider>;
};