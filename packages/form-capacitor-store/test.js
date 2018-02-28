// docs: https://github.com/avajs/ava#assertions
import test from 'ava';
import Store from './dist';

test("set + get", t => {
    const store = new Store;
    store.set(['foo'],'bar');
    t.is(store.get(['foo']),'bar');
})

test("subscribe + context", async t => {
    const store = new Store;
    store.subscribe(['foo','bar'], (val,old,ctx) => {
        t.is(old,undefined);
        t.is(val,'baz');
        t.is(ctx,'world');
    })
    store.set(['foo','bar'],'baz','world');
})

test("subscribe + no context", async t => {
    const store = new Store;
    store.set(['foo','bar'],'bas','some context');
    store.subscribe(['foo','bar'], (val,old,ctx) => {
        t.is(old,'bas');
        t.is(val,'baz');
        t.is(ctx,undefined);
    })
    store.set(['foo','bar'],'baz');
})

test("subscribe fires multiple times", async t => {
    t.plan(2);
    const store = new Store;
    store.subscribe(['foo','bar'], (val,old,ctx) => {
        t.pass();
    })
    store.set(['foo','bar'],1);
    store.set(['foo','bar'],1); // should not invoke subscription
    store.set(['foo','bar'],2);
})

test("subscribe when nested property is mutated", async t => {
    t.plan(2);
    const store = new Store;
    store.subscribe(['foo','bar'], (val,old,ctx) => {
        t.pass();
    })
    store.set(['foo','bar','baz','bux'],1);
    store.set(['foo','baX','baz','bux'],1);
    store.set(['foX','bar','baz','bux'],1);
    store.set(['foo','bar','baz'],1);
})

test("subscribe to root", async t => {
    t.plan(1);
    const store = new Store;
    store.subscribe([], (val,old,ctx) => {
        t.pass();
    })
    store.set(['foo','bar','baz'],'quux');
})

test("mutate root", async t => {
    t.plan(1);
    const store = new Store;
    store.subscribe(['foo'], (val,old,ctx) => {
        t.pass();
    })
    store.set([],{foo:'bar'});
})

test("run all subscriptions", async t => {
    t.plan(3);
    const store = new Store;
    store.subscribe(['foo','bar'], (val,old,ctx) => {
        t.pass();
    })
    store.subscribe([], (val,old,ctx) => {
        t.pass();
    })
    store.subscribe(['bar'], (val,old,ctx) => {
        t.fail();
    })
    store.subscribe(['foo'], (val,old,ctx) => {
        t.pass();
    })
    store.set(['foo','bar','baz'],'quux');
})

test("subscribe when ancestor mutated", async t => {
    t.plan(3);
    const store = new Store;
    store.subscribe(['foo','bar'], (val,old,ctx) => {
        t.pass();
    })
    store.set(['foo'],{bar:1});
    store.set(['foo'],{bar:2});
    // store.set(['foo'],{bar:2});
    store.set(['foo'],{baz:3});
    store.set(['bar'],{baz:4}); // should not run subscription
    store.set([],'root');
})


test("func callback", async t => {
    const store = new Store;
    store.set(['foo'],1);
    store.subscribe(['foo'], (val,old,ctx) => {
        t.is(old,1);
        t.is(val,2);
    })
    store.set(['foo'],x => ++x);
})

test("impure mutation", async t => {
    const store = new Store;
    store.set(['foo'],[]);
    store.subscribe(['foo'], (val,old,ctx) => {
        t.fail();
    })
    store.set(['foo'], x => {
        x.push(1);
        return x;
    });
    t.pass();
})

function dump(...args) {
    console.log(...args.map(a => require('util').inspect(a,{colors:true,depth:10})))
}