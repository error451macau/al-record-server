const express = require('express');
const i18n = require('i18n');
const moment = require('moment');
const nunjucks = require('nunjucks');
const proxy = require('http-proxy-middleware');

var app = express();

// configure i18n
i18n.configure({
	locales:['en', 'zh'],
	directory: __dirname + '/locales',
	autoReload: (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
});

// configure express app
app.enable('strict routing');
app.disable('x-powered-by');
app.use(i18n.init);

// configure nunjucks view engine
nunjucks.configure('views/', {
	express: app,
	watch: (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
}).addFilter('dateFormat', function(date, format = 'YYYY-MM-DD'){
	if(!date) return '';
	var t = moment(date);
	if(!t.isValid()) return '';
	return t.format(format);
});


// when in development mode:
// (1) serve admin at /admin
// (2) proxy_pass to api on port process.env.API_PORT (or default 7777)
// (3) serve build and static at /
// on production server these are handled by nginx
if(process.env.NODE_ENV == 'development'){
    console.log('running in development mode');
    var apiPort = process.env.API_PORT || 7777;
    app.use('/admin', express.static('../monitor-admin/build'));
    app.use('/uploads', express.static('../monitor-api/uploads'));
	app.use('/api', proxy(`http://127.0.0.1:${apiPort}`, {pathRewrite: {'^/api': ''}}));
	app.use('/', express.static('./build'));
	app.use('/', express.static('./static'));
    console.log('proxy_pass-ing /api to 127.0.0.1:%s', apiPort);
}

app.use('/:lang(en|zh)', require('./routers/root.js'));

app.listen(process.env.PORT || 80);
