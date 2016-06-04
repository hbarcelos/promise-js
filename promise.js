'use strict';

const State = {
    PENDING: Symbol.for('pending'),
    FULFILLED: Symbol.for('fulfilled'),
    REJECTED: Symbol.for('rejected')
};

let instanceNo = 1;

function Promise(executor) {
    this._instanceNo = instanceNo++;
    this.state = State.PENDING;
    this.queue = [];

    if (isFunction(executor)) {
        executor(fulfill.bind(this), reject.bind(this));
    }

    run.call(this);
}

module.exports = Promise;

Promise.prototype.then = function(onFulfill, onReject) {
    let p = new Promise();

    let pending = {
        fulfill: isFunction(onFulfill) ? onFulfill : v => v,
        reject: isFunction(onReject) ? onReject : e => { throw e },
        promise: p,
    }

    this.queue.push(pending);

    return p;
};

Promise.prototype.isFulfilled = function(){
    return this.state == State.FULFILLED;
};

Promise.prototype.isRejected = function(){
    return this.state == State.REJECTED;
};

Promise.prototype.isPending = function(){
    return this.state == State.PENDING;
};

Promise.resolve = function(value){
    return new Promise(resolve => resolve(value));
}

Promise.reject = function(reason){
    return new Promise((resolve, reject) => reject(reason));
}


function changeState(state) {
    if (this.state === state) {
        throw new Error('Cannot transition to the same state');
    }

    if(!this.isPending()) {
        throw new Error('Cannot transition from current state');
    }

    if(state !== State.FULFILLED && state !== State.REJECTED) {
        throw new Error('Cannot transition to state ' + state + ': invalid state');
    }

    this.state = state;
}

function isFunction(functionToCheck) {
    return (typeof functionToCheck === 'function' 
        || {}.toString.call(functionToCheck) === '[object Function]');
}

function isObject(objectToCheck) {
    return objectToCheck === Object(objectToCheck);
}

function fulfill(value) {
    try {
        changeState.call(this, State.FULFILLED);
        this.value = value;
    } catch (e) {
        // do nothing, probably already fulfilled or rejected
    } finally {
        run.call(this);
    }
}

function reject(reason) {
    try {
        changeState.call(this, State.REJECTED);
        this.value = reason;
    } catch (e) {
        // do nothing, probably already fulfilled or rejected
    } finally {
        run.call(this);
    }
}

function resolve(promise, x) {
    if (promise === x) {
        promise.reject(new TypeError('Cannot resolve promise with itself'));
    } else if (x && x instanceof Promise) {
        if (x.isPending()) {
            x.then(function(value){
                resolve(promise, value);
            }, function(reason){
                reject.call(promise, reason);
            });
        } else if (x.isFulfilled()) {
            resolve(promise, x.value);
        } else {
            reject.call(promise, x.value);
        }
    } else if (isObject(x) || isFunction(x)) {
        let called = false;

        try {
            let then = x.then;
            if (isFunction(then)) {
                then.call(x, function(y){
                    if (!called) {
                        called = true;
                        resolve(promise, y);
                    }
                }, function(r) {
                    if (!called) {
                        called = true;
                        reject.call(promise, r);
                    }
                });
            } else {
                fulfill.call(promise, x);
            }
        } catch(e) {
            if (!called) {
                reject.call(promise, e);
            }
            return;
        }

    } else {
        fulfill.call(promise, x);
    }
}

function run() {
    if (this.isPending()) return;

    setTimeout(() => {
        while (this.queue.length > 0) {
            let next = this.queue.shift();
            try {
                let fn = this.isFulfilled() ? next.fulfill : next.reject;
                resolve(next.promise, fn(this.value));
            } catch (e) {
                reject.call(next.promise, e);
            }
        }
    }, 1);
}
