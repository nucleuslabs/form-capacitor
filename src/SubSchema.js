import FormContext from './FormContext';
import {toPath} from './helpers';
import React, {useContext} from "react";

export default function SubSchema({path, children}) {
    const {path: contextPath, ...context} = useContext(FormContext);
    if(context.ready) {
        // console.log([...contextPath, ...toPath(path)]);
        return <FormContext.Provider value={Object.assign({path: [...contextPath, ...toPath(path)]}, context)}>
            {children}
        </FormContext.Provider>;
    } else {
        return <span/>;
    }
};