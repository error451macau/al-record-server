const dal = require('./dal');
const express = require('express');

var router = express.Router({mergeParams: true});

router.use(function(req, res, next){
    req.setLocale(req.params.lang);
    res.locals.url = req.url;
    next();
});

router.get('/', function(req, res, next){
    res.render('home.njk');
});

router.get('/deputies', function(req, res, next){
    dal.getDeputies((err, deputies) => {
        if(err) return next(err);
        res.render('deputies.njk', {deputies});
    });
});

module.exports = router;
