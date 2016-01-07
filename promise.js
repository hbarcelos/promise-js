const util = require('util');

module.exports = Promise;

var STATES = {PENDING: 0, FULFILLED: 1, REJECTED: -1};

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
    this.value = value;
    this.state = STATES.FULFILLED;
    onFulfillHandler.call(this, this.value);
}

function enqueueCallback(property, callback) {
    if (isFunction(callback)) {
        property.push(callback);
    }
}

function onFulfillHandler(value)  {
    for (fulfillCallback of this.fulfillCallbackQueue) {
        setTimeout(fulfillCallback.bind(null), 1, value);
    }
    this.fulfillCallBackQueue = [];
}

function reject(reason) {
    this.reason = reason;
    this.state = STATES.REJECTED;
    onRejectHandler.call(this, this.reason);
}

function onRejectHandler(value)  {
    for (rejectCallback of this.rejectCallbackQueue) {
        setTimeout(rejectCallback.bind(null), 1, value);
    }
    this.rejectCallBackQueue = [];
}

function isFulfilled() {
    return this.state == STATES.FULFILLED;
}

function isRejected() {
    return this.state == STATES.REJECTED;
}

function isPending() {
    return this.state == STATES.PENDING;
}

function promiseResolution(promise, x) {
    if (promise === x) {
        throw new TypeError('Cannot resolve promise with itself');
    } else if (x instanceof Promise) {
        if (isFulfilled.call(x)) {
            return new Promise(function(resolve, reject){
                resolve(x.value);
            });
        } else if (isRejected.call(x)) {
            return new Promise(function(resolve, reject){
                reject(x.reason);
            });
        } else {
            return x;
        }
    } else {
        return new Promise(function(resolve, reject){
            resolve(x);
        });
    }
}

function Promise(executor) {
    this.state = STATES.PENDING;
    this.fulfillCallbackQueue = [];
    this.rejectCallbackQueue = [];

    if (isFunction(executor)) {
        executor(fulfill.bind(this), reject.bind(this));
    }
}

Promise.prototype.then = function(onFulfill, onReject) {
    var ret;
    var self = this;

    if (isFulfilled.call(this)) {
        if (isFunction(onFulfill)) {
            return promiseResolution(this, onFulfill(this.value));
        } else {
            return new Promise(function(resolve){
                resolve(self.value);
            });
        }
    } else if (isRejected.call(this)) {
        if (isFunction(onReject)) {
            return promiseResolution(this, onReject(this.reason));
        } else {
            return new Promise(function(resolve, reject){
                reject(self.reason);
            });
        }
    } else if (isPending.call(this)) {
        enqueueCallback(this.fulfillCallbackQueue, onFulfill);
        enqueueCallback(this.rejectCallbackQueue, onReject);
        // ... what now?
    }
};

