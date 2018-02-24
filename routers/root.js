const _ = require('underscore');
const async = require('async');
const dal = require('./dal');
const express = require('express');

var router = express.Router({mergeParams: true});

router.use(function(req, res, next){
    req.setLocale(req.params.lang);
    res.locals.url = req.url;

    // helper method to generate link with locale (for use in template)
    res.locals.mklink = function(type, object){
        switch(type){
            case 'abs':
                return `/${object}`;
            case 'bill':
                return `/${res.locals.locale}/bills/${object.id}/${object.slug}`;
            case 'deputy':
                return `/${res.locals.locale}/deputies/${object.id}/${object.slug}`;
            case 'document':
                return `/${res.locals.locale}/documents/${object.id}/${object.slug}`;
            case 'uploads':
                return `/uploads/${object}`;
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

router.get('/deputies/:id/:slug', function(req, res, next){
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

        var proposerDeputiesIds = _.chain(bills).pluck('proposerDeputiesId').flatten(true).uniq().value();

        dal.getDeputiesByIds(proposerDeputiesIds, function(err, deputies){
            if(err) return next(err);
            
            res.render('bills.njk', {
                bills,
                deputiesDict: _.indexBy(deputies, 'id'),
            });
        });
    });
});

router.get('/bills/:id/:slug', function(req, res, next){
    dal.getBillBySlug(req.params.slug, function(err, bill){
        if(err) return next(err);
        if(!bill) return res.status(404).end();
        
        var relatedDeputyIds = _.union(
            _.pluck(bill.deputyVotes, 'deputyId'),
            bill.proposerDeputiesId
        );

        async.parallel({
            deputies: callback => {
                dal.getDeputiesByIds(relatedDeputyIds, callback);
            },
            documents: callback => {
                dal.getDocumentsByIds(bill.documentIds, callback);
            },
        }, function(err, results){
            if(err) return next(err);

            var deputiesDict  = _.indexBy(results.deputies, 'id');
            var documents     = results.documents;

            // generate voteSummary / statistics
            var voteSummary = {}; // {Y: 10, N: 5, appointedY: 1, directN: 2, APercent: 57, ...}
            bill.deputyVotes.forEach(deputyVote => {
                var deputy = deputiesDict[deputyVote.deputyId];
                var key = deputy.electedMethod + deputyVote.vote;
                voteSummary[key] = (voteSummary[key] || 0) + 1; // per electedMethod per vote
                voteSummary[deputyVote.vote] = (voteSummary[deputyVote.vote] || 0) + 1; // per vote
            });
            voteSummary.total = bill.deputyVotes.length;
            voteSummary.relativeMax = Math.max(voteSummary.Y || 0, voteSummary.N || 0, voteSummary.A || 0, voteSummary.P || 0);

            // more voteSummary (percent)
            voteSummary.YPercent = Math.round((voteSummary.Y || 0) / voteSummary.total * 100);
            voteSummary.NPercent = Math.round((voteSummary.N || 0) / voteSummary.total * 100);
            voteSummary.PPercent = Math.round((voteSummary.P || 0) / voteSummary.total * 100);
            voteSummary.APercent = Math.round((voteSummary.A || 0) / voteSummary.total * 100);
            
            // group deputies by vote and then sort each group in dir->indir->app
            var deputiesGrouped = _.chain(bill.deputyVotes)
                .groupBy('vote')
                .mapObject(function(deputyVotesEntries, vote){ // deputyVotesEntries = [{deputyId: 3, vote: 'Y'}, {deputyId, vote}, ...]
                    return _.chain(deputyVotesEntries)
                        .map(function(deputyVotesEntry){ // {deputyId: 3, vote: 'Y'}
                            return deputiesDict[deputyVotesEntry.deputyId];
                        })
                        // .tap(console.log) // expect: [{deputy Object}, ...] (NOT SORTED)
                        .sortBy(function(deputy){
                            return {
                                'direct':    1,
                                'indirect':  2,
                                'appointed': 3,
                            }[deputy.electedMethod];
                        })
                        .value()
                })
                .value();

            res.render('bill.njk', {
                bill,
                voteSummary,
                deputiesDict,
                deputiesGrouped,
                documents,
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
