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
            case 'localized':
                return `/${res.locals.locale}/${object}`;
            case 'bill':
                return `/${res.locals.locale}/bills/${object.id}/${object.slug}`;
            case 'deputy':
                return `/${res.locals.locale}/deputies/${object.id}/${object.slug}`;
            case 'document': // object is the documentId
                return `/${res.locals.locale}/documents#docid-${object}`;
            case 'uploads':
                return `/uploads/${object}`;
        }
    }

    next();
});

router.get('/', function(req, res, next){
    dal.getHomesActive(function(err, homes){
        if(err) return next(err);
        if(homes.length == 0) return res.status(500).end();

        var home = _.sample(homes);
        
        async.parallel({
            bill: callback => {
                dal.getBillById(home.featuredBillId, callback);
            },
            deputies: callback => {
                dal.getDeputiesByIds([home.featuredDeputyId], callback);
            },
        }, function(err, results){
            if(err) return next(err);

            // generate voteSummary (of featuredBill)
            var voteSummary = {}; // {Y: 10, N: 5, ...}
            results.bill.deputyVotes.forEach(deputyVote => {
                voteSummary[deputyVote.vote] = (voteSummary[deputyVote.vote] || 0) + 1; // per vote
            });
            voteSummary.total = results.bill.deputyVotes.length;
            voteSummary.YPercent = Math.round((voteSummary.Y || 0) / voteSummary.total * 100);
            voteSummary.NPercent = Math.round((voteSummary.N || 0) / voteSummary.total * 100);
            voteSummary.PPercent = Math.round((voteSummary.P || 0) / voteSummary.total * 100);
            voteSummary.APercent = Math.round((voteSummary.A || 0) / voteSummary.total * 100);

            res.locals.canonicalPath = '/';
            res.render('home.njk', {
                featuredBill: results.bill,
                featuredDeputy: results.deputies[0],
                featuredDeputySpeech: home.featuredDeputySpeech,
                voteSummary: voteSummary,
            });
        });
    })
});

router.get('/deputies', function(req, res, next){
    dal.getDeputies((err, deputies) => {
        if(err) return next(err);
        
        res.locals.canonicalPath = '/deputies';
        res.render('deputies.njk', {
            deputiesGroupped: _.groupBy(deputies, 'electedMethod'),
        });
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

            res.locals.canonicalPath = `/deputies/${deputy.id}/${deputy.slug}`;
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
            
            res.locals.canonicalPath = '/bills';
            res.render('bills.njk', {
                bills: _.sortBy(bills, 'date').reverse(),
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
            
            // group deputies by vote
            // then group by specialStatus
            // and then sort each group in dir->indir->app
            var deputiesGroupped = _.chain(bill.deputyVotes)
                .groupBy('vote')
                .mapObject(function(deputyVotesEntries, vote){ // deputyVotesEntries = [{deputyId: 3, vote: 'Y'}, {deputyId, vote}, ...]
                    return _.chain(deputyVotesEntries)
                        .groupBy(s => s.specialStatus || '')
                        .mapObject(function(deputyVotesEntriesInner, status){ // same structure as above
                            return _.sortBy(deputyVotesEntriesInner, function(deputyVote){
                                const deputy = deputiesDict[deputyVote.deputyId];

                                return {
                                    'direct':    1,
                                    'indirect':  2,
                                    'appointed': 3,
                                }[deputy.electedMethod];
                            })
                        })
                        .value();
                })
                .value();

            res.locals.canonicalPath = `/bills/${bill.id}/${bill.slug}`;
            res.render('bill.njk', {
                bill,
                voteSummary,
                deputiesDict,
                deputiesGroupped,
                documents,
            });
        });
    })
});

router.get('/documents', function(req, res, next){
    dal.getDocuments((err, documents) => {
        if(err) return next(err);
        res.locals.canonicalPath = '/documents';
        res.render('documents.njk', {documents});
    });
});

router.get('/about', function(req, res, next){
    res.locals.canonicalPath = '/about';
    res.render('about.njk');
});

module.exports = router;
