const _ = require('underscore');
const dal = require('./dal');
const express = require('express');

var router = express.Router({mergeParams: true});

router.use(function(req, res, next){
    req.setLocale(req.params.lang);
    res.locals.url = req.url;

    // helper method to generate link with locale (for use in template)
    res.locals.mklink = function(path){
        // cannot mklink with non-string
        if(typeof path !== 'string') return '';

        // if absolute, return as-is (reserve for future use)
        if(path[0] == '/'){
            return path;
        } else { // assume relative, prepend locale
            return `/${res.locals.locale}/${path}`;
        }
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
    dal.getDeputyBySlug(req.params.slug, function(err, deputy){
        if(err) return next(err);
        if(!deputy) return res.status(404).end();

        dal.getBillsLatest(10, function(err, latestBills){
            if(err) return next(err);

            latestBills.forEach(bill => {
                var thisDeputyVote = _.findWhere(bill.deputyVotes, {deputyId: deputy.id});
                bill.theirVote = thisDeputyVote ? thisDeputyVote.vote : 'NA';
                // NA if this deputy not involved in this vote

            });

            res.render('deputy.njk', {deputy, latestBills});
        })
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

router.get('/bill/:slug', function(req, res, next){
    dal.getBillBySlug(req.params.slug, function(err, bill){
        if(err) return next(err);
        if(!bill) return res.status(404).end();
        
        var relatedDeputyIds = _.pluck(bill.deputyVotes, 'deputyId').concat(bill.proposerDeputyId);

        dal.getDeputiesByIds(relatedDeputyIds, function(err, deputies){
            if(err) return next(err);

            var deputiesDict = _.indexBy(deputies, 'id');

            var voteSummary = {}; // {indirect: 10, appointedY: 1, directN: 2, ...}
            bill.deputyVotes.forEach(deputyVote => {
                var deputy = deputiesDict[deputyVote.deputyId];
                var key = deputy.electedMethod + deputyVote.vote;
                voteSummary[key] = (voteSummary[key] || 0) + 1; // per electedMethod per vote
                voteSummary[deputyVote.vote] = (voteSummary[deputyVote.vote] || 0) + 1; // per vote
            });
            voteSummary.total = bill.deputyVotes.length;
            voteSummary.relativeMax = Math.max(voteSummary.Y, voteSummary.N, voteSummary.A, voteSummary.P)

            res.render('bill.njk', {
                bill,
                voteSummary,
                deputiesDict,
            });
        });
    })
});

router.get('/documents', function(req, res, next){
    dal.getDocuments((err, documents) => {
        if(err) return next(err);
        res.render('documents.njk', {documents});
    });
});

module.exports = router;
