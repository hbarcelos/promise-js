var Promise = require('./promise');
var util = require('util');

var adapter = (function() {
    var res, rej;
    return {
        deferred: function() {
            return {
                promise: new Promise(function(resolve, reject){
                    res = resolve;
                    rej = reject;
                }),
                resolve: res,
                reject: rej,
            }
        }
    }
})();

describe("Promises/A+ Tests", function () {
    require("promises-aplus-tests").mocha(adapter);
});
