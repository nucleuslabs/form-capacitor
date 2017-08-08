/**
 * Unwraps a value. If passed a function, evaluates that function with the provided args. Otherwise, returns the value as-is.
 */
export function resolveValue<T>(this: any, functionOrValue: ((...args: any[]) => T)|T, ...args: any[]): T {
    return typeof functionOrValue === 'function' ? functionOrValue.call(this, ...args) : functionOrValue;
}

export const defaultDeserialize = x => x === undefined ? '' : String(x);
export const defaultSerialize = x => x;