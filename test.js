var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

var assert = chai.assert;

var Promise = require('./promise');

describe('Promise', function(){

    describe('#constructor', function(){

        it('Should successfully create a promise object', function(done){
            assert.instanceOf(new Promise(function(resolve, reject){

            }), Promise);
            done();
        });


        it('Should create a promise object in pending state', function(done){
            var p = new Promise();
            assert.equal(p.state, 0);
            done();
        });

    });

    describe('#then: synchronous behavior', function(){
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

    describe('#then: asynchronous behavior', function(){
        var p;
        beforeEach(function(){
            p = new Promise(function(resolve, reject){
                setTimeout(function(){
                    resolve(1);
                }, 200);
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
});

