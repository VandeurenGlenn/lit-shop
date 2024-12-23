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
    apiKey: 'AIzaSyAUTqcR0LQMOP1wQk3yh4x4QIaMAe6KSuQ',
    authDomain: 'hello-new-me.firebaseapp.com',
    databaseURL: 'https://hello-new-me-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'hello-new-me',
    storageBucket: 'hello-new-me.firebasestorage.app',
    messagingSenderId: '108028336132',
    appId: '1:108028336132:web:d49e8ec6020408c77cfd51',
    measurementId: 'G-3SJ2QVZH3T'
};
const app = initializeApp$1(firebaseConfig);
const database = getDatabase$1(app);
const productsRef = ref(database, '/products');
const categoriesRef = ref(database, '/categories');
const transformProducts = (products) => {
    for (const key of Object.keys(products)) {
        products[key].key = key;
    }
    return products;
};
const CACHE_TIME = 30000;
const cache = new Map();
const getProducts = async () => {
    if (cache.has('products') && cache.get('products').timestamp + CACHE_TIME > new Date().getTime()) {
        console.log('from cache');
        return cache.get('products').value;
    }
    const items = await (await get(productsRef)).val();
    if (!items)
        return [];
    cache.set('products', {
        value: transformProducts(items),
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
        value: items,
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
router.get('/api/products', async (ctx) => {
    ctx.body = await getProducts();
});
router.get('/api/admin/images', async (ctx) => {
    ctx.body = await getProducts();
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
