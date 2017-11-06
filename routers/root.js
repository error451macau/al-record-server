const express = require('express');

var router = express.Router({mergeParams: true});

router.use(function(req, res, next){
    next();
});

router.get('/', function(req, res, next){
    res.render('home.njk');
});

module.exports = router;
