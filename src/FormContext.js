import * as React from "react";

const FormContext = React.createContext({});

export const FormProvider = FormContext.Provider;
export const FormConsumer = FormContext.Consumer;

export default FormContext;