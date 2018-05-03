const async = require('async');
const dal = require('./routers/dal');
const fs = require('fs');
const sitemap = require('sitemap');

var urls = [ // static urls
    // {url: '/en/', changefreq: 'daily', priority: 0.7},
    {url: '/zh/', changefreq: 'daily', priority: 0.7},
    // {url: '/en/deputies', changefreq: 'weekly', priority: 0.5},
    {url: '/zh/deputies', changefreq: 'weekly', priority: 0.5},
    // {url: '/en/bills', changefreq: 'weekly', priority: 0.7},
    {url: '/zh/bills', changefreq: 'weekly', priority: 0.7},
    // {url: '/en/documents', changefreq: 'weekly', priority: 0.7},
    {url: '/zh/documents', changefreq: 'weekly', priority: 0.7},
]

async.parallel({
    deputies: callback => {
        dal.getDeputies(callback)
    },
    bills: callback => {
        dal.getBills(callback)
    },
}, function(err, result){
    if(err){
        return console.error(err);
    }

    result.deputies.forEach(deputy => {
        // urls.push({url: `/en/deputies/${deputy.id}/${deputy.slug}`, changefreq: 'weekly', priority: 0.5});
        urls.push({url: `/zh/deputies/${deputy.id}/${deputy.slug}`, changefreq: 'weekly', priority: 0.5});
    })

    result.bills.forEach(bill => {
        // urls.push({url: `/en/bills/${bill.id}/${bill.slug}`, changefreq: 'weekly', priority: 0.5});
        urls.push({url: `/zh/bills/${bill.id}/${bill.slug}`, changefreq: 'weekly', priority: 0.5});
    })

    sitemap.createSitemap({
        hostname: 'https://al.error451macau.com',
        urls: urls,
        cacheTime: 60000
    }).toXML(function(err, xml){
        if(err){
            return console.error(err);
        }

        fs.writeFileSync('./build/sitemap.xml', xml);
        console.log('done');
    });
});