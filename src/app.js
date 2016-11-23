let MongoClient = require('mongodb').MongoClient,
    co = require('co'),
    assert = require('assert'),
    fs = require('fs');

const url = 'mongodb://docker:27017/testdb',
    types = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 210, 210, 220, 230, 240, 250, 260],
    n = 10000;

let jsondata = fs.readFileSync('json/trans_type.json', 'utf8'),
    data = JSON.parse(jsondata);

const phones = [
    () => { return '79214045559'; },
    () => { return '79214040009'; },
    () => { return '79214045559'; },
    () => { return '79214040009'; },
    () => { return '79214045559'; },
    () => { return '79214040009'; },
    () => { return '79214045559'; },
    () => { return '79214040009'; },
    () => { return getRandomInt(79211000000, 79219999999).toString(); }
];

function prepareData() {
    let result = Object.assign({}, data);
    result.global_type = types[Math.floor(Math.random() * types.length)];
    result.msisdn = phones[Math.floor(Math.random() * phones.length)]();
    result.created = new Date(Date.now()).toISOString();

    return result;
}

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

co(function* () {
    let db = yield MongoClient.connect(url);
    console.log('Connected correctly to server');

    // Get the findAndModify collection
    let col = db.collection('transactions');
    let docs = new Array(n);

    for (let i = 0; i < docs.length; i++) {
        docs[i] = prepareData();
    }
    let r = yield col.insertMany(docs);

    assert.equal(n, r.result.n);

    console.log(`Insert ${n} complete`);

    db.close();

    process.exit(0);
}).catch(function(err) {
    console.log(err.stack);
});
