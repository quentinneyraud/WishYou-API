var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('User', new Schema({
    contact: {
        firstName: String,
        lastName: String,
        email: String
    },
    account: {
        validated: {
            type: Boolean,
            default: false
        },
        password: String,
        facebookId: Number
    },
    friends: Array,
    wishes: Array
}));