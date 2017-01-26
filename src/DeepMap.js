const MAP = Symbol('Entries');

class DeepMap {
    constructor() {
        this[MAP] = new WeakMap();
    }

    /**
     * @param {Array.<*>} key
     * @param {*} value
     * @return {void}
     */
    set(key, value) {
        let end = key.length - 1;
        let map = this[MAP];
        for(let i=0; i<end; ++i) {
            if(map.has(key[i])) {
                map = map.get(key[i]);
            } else {
                map.set(key[i], map = new Map());
            }
        }
        map.set(key[end], value);
    }

    /**
     * @param {Array.<*>} key
     * @param {*=} defaultValue
     * @return {*}
     */
    get(key, defaultValue) {
        let value = this[MAP];
        for(let k of key) {
            if(!value.has(k)) return defaultValue;
            value = value.get(k);
        }
        return value;
    }

    /**
     * @param {Array.<*>} key
     * @return {void}
     */
    delete(key) {
        let end = key.length - 1;
        let map = this[MAP];
        for(let i=0; i<end; ++i) {
            map = map.get(key[i]);
            if(!map) return;
        }
        map.delete(key[end]);
    }
}

module.exports = DeepMap;