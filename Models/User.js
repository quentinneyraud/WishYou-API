var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('User', new Schema({
    name: {
        first: String,
        last: String
    },
    password: String,
    contacts: {
        facebookId: Number,
        mail: String
    },
    confirmed: {
        type: Boolean,
        default: false
    }
}));