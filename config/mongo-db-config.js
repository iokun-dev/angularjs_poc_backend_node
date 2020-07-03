
let mongoose = require('mongoose');

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect('mongodb://localhost:27017/pocDb', options);
let conn = mongoose.connection;
conn.on('error', console.error.bind(console, 'connection error:'));
conn.once('open', () => {
    console.log('Mongoose connected by pocdb');
});

mongoose.set('debug', true);
module.exports = conn;