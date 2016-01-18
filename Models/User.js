var mongoose = require('mongoose')
var Schema = mongoose.Schema

// set up a mongoose model
module.exports = mongoose.model('User', new Schema({
    contact: {
        firstName: String,
        lastName: String,
        email: String
    },
    account: {
        password: String,
        facebookId: Number,
        createdAt: Date
    },
    friends: Array,
    wishes: Array
}))