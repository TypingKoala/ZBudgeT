const mongoose = require('mongoose');
if (process.env.NODE_ENV === "production") {
    mongoaddr = process.env.mongoProd
} else {
    mongoaddr= process.env.mongoDev
}

mongoose.connect(mongoaddr, {
    useNewUrlParser: true
}, (err) => {
    if (err) {
        console.log(err.message)
    } else {
        console.log(`MongoDB connection to ${mongoaddr} succeeded.`)
    }
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = mongoose;