// inspired by https://github.com/mroderick/PubSubJS/blob/903eb3c45e335ae5bfcda40ae9c5894583869dd8/src/pubsub.js#L168
import {toPath, get as getValue, unset, debounce} from 'lodash';
import {setValue} from 'form-capacitor-util/util';

export default class Store {
    constructor() {
        this.subscriptions = Object.create(null);
        this.data = Object.create(null);
        this.counter = 0;
        
        // debounce calls to _fireSubscriptions so that we can aggregate
        // consecutive calls to set() and unset()
        // may want to use a setImmediate polyfill (https://github.com/YuzuJS/setImmediate)
        // instead of Lodash's debounce() which depends on setTimeout
        // and as such is subject to a ~10ms delay
        this._fireSubscriptions = debounce(() => {
            for(let v of Object.values(this.subscriptions)) {
                let newValue = getValue(this.data, v[0]);
                if(!Object.is(v[2],newValue)) {
                    v[2] = newValue;
                    v[1](newValue,v[2]);
                }
            }
        });
    }

    subscribe(path, callback) {
        path = toPath(path);
        let key = this.counter++;
        this.subscriptions[key] = [path,callback,getValue(this.data,path)];

        return () => {
            delete this.subscriptions[key];
        }
    }
    
    get(path) {
        return getValue(this.data, path);
    }
    
    unset(path) {
        if(unset(this.data, path)) {
            this._fireSubscriptions();
        }
    }

    set(path, value) {
        path = toPath(path);
        let oldValue = getValue(this.data, path);
        if(Object.is(oldValue, value)) return;
        setValue(this.data, path, value);
        this._fireSubscriptions();
    }
    
    toJSON() {
        // TODO: strip undefined values?
        return this.data;
    }
}

