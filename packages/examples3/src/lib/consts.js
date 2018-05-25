export const EMPTY_ARRAY = Object.freeze([]);
export const EMPTY_OBJECT = Object.freeze(Object.create(null));
export const EMPTY_MAP = Object.freeze(new Map); // warning: this doesn't actually prevent anyone from setting things; see https://stackoverflow.com/a/35776333/65387
export const EMPTY_SET = Object.freeze(new Set);
export const NO_OP = Object.freeze(() => {});