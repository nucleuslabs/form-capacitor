const store = Object.create(null);
export default store;

declare global {
    interface Window { __FC_STORE__: object; }
}

if(typeof window === 'object' && process.env.NODE_ENV !== 'production') {
   window.__FC_STORE__ = store;
}