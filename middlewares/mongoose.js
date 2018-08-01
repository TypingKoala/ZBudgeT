const mongoose = require('mongoose');
var mongoaddr = process.env.MONGOADDR;

mongoose.connect(mongoaddr, {
    useNewUrlParser: true
}, (err) => {
    if (err) {
        console.log(err.message)
    } else {
        console.log('MongoDB connection successful.')
    }
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = mongoose;