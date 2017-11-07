/**
 * Data Abstraction Layer
 */

var request = require('request');

var dal = module.exports = {};

var apiPort = process.env.API_PORT || 7777;
var apiBase = `http://127.0.0.1:${apiPort}/`;

request = request.defaults({
    baseUrl: apiBase,
})

dal.getDeputies = function(callback = () => {}){
    request({
        uri: '/deputies',
        json: true,
    }, function(err, response, body){
        callback(err, body);
    })
}

dal.getDeputyByName = function(slug, callback = () => {}){
    request({
        uri: '/deputies',
        qs: {slug},
        json: true,
    }, function(err, response, body){
        if(err) return callback(err);
        if(body.length == 0) return callback(null, null); // return null if no match
        callback(err, body[0]);
    })
}
