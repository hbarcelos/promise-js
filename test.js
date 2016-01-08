var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var assert = chai.assert;

var Promise = require('./promise');

describe('Promise', function(){

    describe('#constructor', function(){

        it('Should successfully create a Promise object', function(done){
            assert.instanceOf(new Promise(function(resolve, reject){

            }), Promise);
            done();
        });


        it('Should create a promise object in pending state', function(done){
            var p = new Promise();
            assert(p.isPending());
            done();
        });

    });

    describe('#then: resolving with synchronous behavior', function(){
        var p;
        beforeEach(function(){
            p = new Promise(function(resolve, reject){
                resolve(1);
            });
        });

        it('Should return immediatly synchronously resolved value of promise', function(done){
            p.then(function(result){
                assert.equal(result, 1);
                done();
            });
        });

        it('Should return same result on multiple calls', function(done){
            p.then(function(result){
                assert.equal(result, 1);
            });

            p.then(function(result){
                assert.equal(result, 1);
                done();
            });
        });

        it('Should return correct results on chained calls', function(done){
            p.then(function(result){
                assert.equal(result, 1);
                return 2;
            }).then(function(result2){
                assert.equal(result2, 2);
                done();
            });
        });
    });

    describe('#then: resolving with asynchronous behavior', function(){
        var p;
        beforeEach(function(){
            p = new Promise(function(resolve, reject){
                setTimeout(function(){
                    resolve(1);
                }, 50);
            });
        });

        it('Should return asynchronously resolved value of promise', function(done){
            p.then(function(result){
                assert.equal(result, 1);
                done();
            });
        });

        it('Should return same result on multiple calls', function(done){
            p.then(function(result){
                assert.equal(result, 1);
            });

            p.then(function(result){
                assert.equal(result, 1);
                done();
            });
        });

        it('Should return correct results on chained calls', function(done){
            p.then(function(result){
                assert.equal(result, 1);
                return 2;
            }).then(function(result2){
                assert.equal(result2, 2);
                done();
            });
        });
    });

    describe('#then: rejecting', function() {
        var p;
        beforeEach(function(){
            p = new Promise(function(resolve, reject){
                setTimeout(function(){
                    reject(new Error());
                }, 50);
            });
        });

        it('Should call onReject callback when rejected', function(done){
            p.then(function(result){
            }, function(reason){
                assert.instanceOf(reason, Error);
                done();
            });
        });

        it('Should also reject chained promise when no onReject callback is provided', function(done){
            p.then().then(function(){}, function(reason){
                assert.instanceOf(reason, Error);
                done();
            });
        });
    });

    describe('#resolve', function(){
        it('Should create a fulfilled promise', function(done){
            var p = Promise.resolve(1);
            p.then(function(value){
                assert.equal(value, 1);
                done();
            });
        });
    });
    
    describe('#reject', function(){
        it('Should create a rejected promise', function(done){
            var p = Promise.reject(new Error());
            p.then(function(){}, function(reason){
                assert.instanceOf(reason, Error);
                done();
            });
        });
    });
});

