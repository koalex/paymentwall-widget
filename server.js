'use strict';

global.__DEV__ 		= process.env.NODE_ENV === 'development';

const fs            = require('fs');
const path          = require('path');
const join          = path.join;
const koa           = require('koa');
const cors          = require('@koa/cors');
const app           = new koa();
const helmet        = require('koa-helmet');
const Router        = require('koa-router');
const serve         = require('koa-static');
const bunyan        = require('bunyan');
const uuid          = require('uuid/v4');
const conditional   = require('koa-conditional-get');
const etag          = require('koa-etag');
const compress      = require('koa-compress');
const bodyParser    = require('koa-bodyparser');

require('events').EventEmitter.defaultMaxListeners = Infinity;

process.on('unhandledRejection', err => {
	console.error(err);
	log.error(err);
	process.exit(1);
});
process.on('uncaughtException', err => {
	console.error(err);
	log.error(err);
	process.exit(1);
});

app.use(cors({
	allowMethods: ['GET', 'POST'],
	origin: null
}));

app.use(helmet());

app.use(async (ctx, next) => {
	let url = path.normalize(ctx.request.url);

	if (url.endsWith(`.html`) || url == '/') return await next();

	return serve(join(process.cwd(), 'dist'), {
		maxage : 86400000*30,
		gzip: true,
		usePrecompiledGzip: true
	})(ctx, next);
});

let log = bunyan.createLogger({
	name: 'APP',
	requestId: uuid(),
	streams: [
		{
			level: 'error',
			path: join(process.cwd(), './logs/errors.log')
		}
	]
});

app.use(async (ctx, next) => {
	try {
		await next();
	} catch (err) {
		log.error(err);

		if (__DEV__) {
			console.error(err);
		} else {
			ctx.status = ctx.status > 500 ? 500 : ctx.status;
			ctx.body = 'Server error';
		}
	}
});


app.use(bodyParser({ // application/json , application/x-www-form-urlencoded ONLY
	formLimit: '1mb',
	jsonLimit: '1mb'
}));

app.use(conditional());
app.use(etag());


/**
 ROUTES
 **/
const router = new Router();

router.post('/submit', async ctx => {
	const { cvv, amount, cardHolder, cardNumber, expireYear, expireMonth, countryCode } = ctx.request.body;

	ctx.type = 'json';

	if (!cvv || (123 == cvv)) {
		ctx.status = 400;
		return ctx.body = {
			message: [{
				field: 'cvv',
				message: 'Bad CVV'
			}]
		};
	}

	ctx.body = { message: 'success' };
});

router.get('/', async ctx => {
	ctx.type = 'html';
	ctx.body = await new Promise((resolve, reject) => {
		fs.readFile('./dist/index.html', (err, html) => {
			if (err) return reject(err);
			resolve(html);
			// resolve(html.toString('utf-8').replace('#!csrf', ctx.csrf));
		});
	});
});

router.get('/materialize', async ctx => {
	ctx.type = 'html';

	ctx.body = await new Promise((resolve, reject) => {
		fs.readFile('./dist/materialize.html', (err, html) => {
			if (err) return reject(err);
			resolve(html);
			// resolve(html.toString('utf-8').replace('#!csrf', ctx.csrf));
		});
	});
});

app.use(router.routes());



const server = app.listen(3000);
console.log('SERVER LISTENING ON PORT: 3000');


module.exports = server;
