import FormContext from './FormContext';
import {toPath} from './helpers';
import React, {useContext} from "react";

export default function useSchemaPath(FunctionalComponent, path) {
    const {path: contextPath, ...context} = useContext(FormContext);
    if(context.ready) {
        return <FormContext.Provider value={Object.assign({path: [...contextPath, ...toPath(path)]}, context)}>
            <FunctionalComponent/>
        </FormContext.Provider>;
    } else {
        return <span/>;
    }
};