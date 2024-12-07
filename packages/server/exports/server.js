import Koa from 'koa';
import koaStatic from 'koa-static';
import koaCompress from 'koa-compress';
import Router from 'koa-router';
import { initializeApp as initializeApp$1 } from 'firebase/app';
import { getDatabase as getDatabase$1, ref, get } from 'firebase/database';
import mime from 'mime-types';
import request from 'request';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { readFile } from 'fs/promises';
import { constants } from 'zlib';

const serviceAccount = JSON.parse((await readFile(process.env.npm_config_local_prefix + '/serviceAccountKey.json')).toString());
initializeApp({
    credential: cert(serviceAccount),
    databaseURL: 'https://topveldwinkel.firebaseio.com'
});
const database$1 = getDatabase();
const router$1 = new Router();
router$1.get('/api/admin/api-keys', async (ctx) => {
    const idToken = ctx.request.headers['x-lit-shop-id'];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const snap = await database$1.ref('/admins').child(uid).get();
    console.log(snap);
    ctx.body = serviceAccount.apis;
});
const routes$1 = router$1.routes();

const firebaseConfig = {
    apiKey: 'AIzaSyAgSXxNo6LSsBHxa4El3MWbPjqfDgcD0h0',
    authDomain: 'topveldwinkel.firebaseapp.com',
    databaseURL: 'https://topveldwinkel.firebaseio.com',
    projectId: 'topveldwinkel',
    storageBucket: 'topveldwinkel.appspot.com',
    messagingSenderId: '467877680173',
    appId: '1:467877680173:web:1781bc21aadaef72'
};
const app = initializeApp$1(firebaseConfig);
const database = getDatabase$1(app);
const offersRef = ref(database, '/offers');
const categoriesRef = ref(database, '/categories');
const transformOffers = (offers) => {
    for (const key of Object.keys(offers)) {
        offers[key].key = key;
    }
    return offers;
};
const CACHE_TIME = 30000;
const cache = new Map();
const getOffers = async () => {
    if (cache.has('offers') && cache.get('offers').timestamp + CACHE_TIME > new Date().getTime()) {
        console.log('from cache');
        return cache.get('offers').value;
    }
    const items = await (await get(offersRef)).val();
    cache.set('offers', {
        value: transformOffers(items),
        timestamp: new Date().getTime()
    });
    console.log('fresh');
    return items;
};
const getCategories = async () => {
    if (cache.has('categories') && cache.get('categories').timestamp + CACHE_TIME > new Date().getTime()) {
        console.log('from cache');
        return cache.get('categories').value;
    }
    const items = (await (await get(categoriesRef)).val()) || [];
    cache.set('categories', {
        value: transformOffers(items),
        timestamp: new Date().getTime()
    });
    console.log('fresh');
    return items;
};
const router = new Router();
router.get('/api/image', async (ctx) => {
    console.log('request');
    // @ts-ignore
    if (ctx.request.query.image) {
        ctx.body = request(ctx.request.query.image);
        ctx.type = mime.lookup(ctx.request.query.image);
    }
    else
        ctx.status = 404;
});
router.get('/api/categories', async (ctx) => {
    ctx.body = await getCategories();
});
router.get('/api/offers', async (ctx) => {
    ctx.body = await getOffers();
});
router.get('/api/admin/images', async (ctx) => {
    ctx.body = await getOffers();
});
const routes = router.routes();
const server = new Koa();
server.use(koaCompress({
    filter(content_type) {
        console.log(content_type);
        console.log(/text|application\/javascript/i.test(content_type));
        return /text|application\/javascript/i.test(content_type);
    },
    threshold: 2048,
    gzip: {
        flush: constants.Z_SYNC_FLUSH
    },
    deflate: {
        flush: constants.Z_SYNC_FLUSH
    },
    br: false // disable brotli
}));
server.use(koaStatic('./../admin/www'));
server.use(routes);
server.use(routes$1);
server.listen(3005);
