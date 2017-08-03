// interface FormProps {
//     data: any,
// }


export type MapFn<T, U> = (input: T) => U;

export type DispatchFn = (name: string, value: any) => void;