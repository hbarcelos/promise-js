const util = require('util');

const State = {
    PENDING: Symbol.for('pending'),
    FULFILLED: Symbol.for('fulfilled'),
    REJECTED: Symbol.for('rejected')
};

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

function isThennable(objectToCheck) {
    return isObject(objectToCheck) && isFunction(objectToCheck.then);
}

function fulfill(value) {
    changeState.call(this, State.FULFILLED);
    this.value = value;
    run.call(this);
}

function reject(reason) {
    changeState.call(this, State.REJECTED);
    this.value = reason;
    run.call(this);
}

function resolve(promise, x) {
    if (promise === x) {
        promise.reject(new TypeError('Cannot resolve promise with itself'));
    } else if (x && x instanceof Promise) {
        if (x.isPending()) {
            x.then(function(value){
                fulfill.call(promise, value);
            }, function(reason){
                reject.call(promise, value);
            });
        } else if (x.isFulfilled()) {
            fulfill.call(promise, x.value);
        } else if (x.isRejected()) {
            reject.call(promise, x.value);
        }
    } else {
        fulfill.call(promise, x);
    }
}

function run() {
    if (this.isPending()) return;

    setTimeout(() => {
        while (this.queue.length > 0) {
            var next = this.queue.shift();
            try {
                var fn = this.isFulfilled() ? next.fulfill : next.reject;
                resolve(next.promise, fn(this.value));
            } catch (e) {
                reject.call(next.promise, e);
            }
        }
    }, 0);
}

function Promise(executor) {
    this.state = State.PENDING;
    this.queue = [];

    if (isFunction(executor)) {
        executor(fulfill.bind(this), reject.bind(this));
    }
}

Promise.prototype.then = function(onFulfill, onReject) {
    var p = new Promise();

    this.queue.push({
        fulfill: isFunction(onFulfill) ? onFulfill : v => v,
        reject: isFunction(onReject) ? onReject : e => { throw e },
        promise: p,
    });

    run.call(this);

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

module.exports = Promise;
