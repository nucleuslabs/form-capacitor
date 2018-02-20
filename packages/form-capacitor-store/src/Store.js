// inspired by https://github.com/mroderick/PubSubJS/blob/903eb3c45e335ae5bfcda40ae9c5894583869dd8/src/pubsub.js#L168
import {toPath, unset} from 'lodash';
import {setValue,setValueMut,getValue} from './util';
// import debounce from '../fast-debounce';

const SUB = Symbol('subscriptions');

export default class Store {
    constructor() {
        this.subscriptions = Object.create(null);
        this.data = Object.create(null);
    }
    
    _fireSubscriptions(path,context) {
        // console.log('fire',path.join('.'));

        let it = this.subscriptions;

        // console.log('------------------- fire',path.join('.'));

        for(let i=0;;) {
            this._runPath(it, path.slice(0, i), context);
            if(i === path.length) break;
            it = it[path[i]];
            if(!it) break;
            ++i;
        }

        if(it) {
            this._runSubTree(it,path,context);
        }
    }
    
    _runSubTree(tree,path,context) {
        for(let [key, subtree] of Object.entries(tree)) {
            let p = [...path, key];
            this._runPath(subtree, p, context);
            this._runSubTree(subtree, p, context); // <-- fixme: this should be breadth-first not depth-first
        }
    }

    _runPath(subtree,path,context) {
        if(subtree[SUB]) {
            let currentValue = getValue(this.data, path);

            for(let sub of getSymbolValues(subtree[SUB])) {
                if(!Object.is(currentValue, sub[1])) {
                    sub[0](currentValue, sub[1], context);
                    sub[1] = currentValue;
                } else {
                    console.log(`values are the same at path '${path.join('.')}' -- skipping subscription`)
                }
            }
        }
    }

    subscribe(path, callback) {
        path = toPath(path);

        let subKey = Symbol("subscriptionKey");

        let subPath = [...path,SUB,subKey];
        let subTuple = [callback,getValue(this.data,path)]; // <--- fixme: do we need to store the value here or can we store it once per node?? or maybe not at all now that we're just iterating the proper nodes
        
        setValueMut(this.subscriptions, subPath, subTuple);


        dump(this.subscriptions);

        // this.subscriptions[subKey] = [path,callback,getValue(this.data,path)];

        // unsub.key = subKey;
        return () => {
            unset(this.subscriptions, subPath);
        };
    }

    get(path) {
        return getValue(this.data, path);
    }

    unset(path) {
        if(unset(this.data, path)) {
            this._fireSubscriptions(path);
        }
    }

    set(path, value, context) {
        path = toPath(path);
        let oldValue = getValue(this.data, path);
        if(typeof value === 'function') {
            value = value(oldValue);
        }
        if(Object.is(oldValue, value)) return;
        this.data = setValue(this.data, path, value);
        this._fireSubscriptions(path, context);
    }

    toJSON() {
        return this.data;
    }
}

function getSymbolValues(obj) {
    return Object.getOwnPropertySymbols(obj).map(sym => obj[sym]);
}

function dump(...args) {
    console.log(...args.map(a => require('util').inspect(a,{colors:true,depth:10})))
}