const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db; //this is a local variable. 

const mongoConnect = callback => {
    MongoClient.connect(
        'mongodb+srv://francispham:Heroman1989@nodebasic-4blxc.mongodb.net/shop?retryWrites=true',
        {
            useNewUrlParser: true
        })
        .then(client => {
            console.log('MongoDB Connected!');
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;