import Store from '../Store';

const store = new Store();

export default store;

if(typeof window === 'object' && process.env.NODE_ENV !== 'production') {
    window.__FC_STORE__ = store;
}