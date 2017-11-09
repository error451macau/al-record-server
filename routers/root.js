const _ = require('underscore');
const dal = require('./dal');
const express = require('express');

var router = express.Router({mergeParams: true});

router.use(function(req, res, next){
    req.setLocale(req.params.lang);
    res.locals.url = req.url;

    // helper method to generate link with locale (for use in template)
    res.locals.mklink = function(path){ // path is expect to start with /
        return `/${res.locals.locale}${path}`;
    }

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

router.get('/deputy/:slug', function(req, res, next){
    dal.getDeputyByName(req.params.slug, function(err, deputy){
        if(err) return next(err);
        if(!deputy) return res.status(404).end();
        res.render('deputy.njk', {deputy});
    })
});

router.get('/bills', function(req, res, next){
    dal.getBills((err, bills) => {
        if(err) return next(err);

        var proposerDeputyIds = _.pluck(bills, 'proposerDeputyId');
        dal.getDeputiesByIds(proposerDeputyIds, function(err, deputies){
            if(err) return next(err);
            
            res.render('bills.njk', {
                bills,
                deputiesDict: _.indexBy(deputies, 'id'),
            });
        });
    });
});

module.exports = router;
