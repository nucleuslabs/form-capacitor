const store = Object.create(null);

if(typeof window === 'object' && process.env.NODE_ENV !== 'production') {
    window.__FC_STORE__ = store;
}

export default store;