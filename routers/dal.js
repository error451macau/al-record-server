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