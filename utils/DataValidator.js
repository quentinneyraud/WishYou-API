var validator = require('validator');

module.exports = {

    init: function(){
        this.errors = [];
        return this
    },

    validateString: function(string, minChars, maxChars){
        if(!validator.isAlpha(string)){
            this.errors.push('"' + string + '" is not a valid string')
        }else if(string.length < minChars || string.length > maxChars){
            this.errors.push("'" + string + "' is not valid. It must be between " + minChars + " and " + maxChars + " characters")
        }
        return this
    },

    validateEmail: function(email){
        if(!validator.isEmail(email)){
            this.errors.push("'" + email + "' is not a valid email.")
        }
        return this
    },

    validateLength: function(string, minChars, maxChars){
        if(string.length < minChars || string.length > maxChars){
            this.errors.push("'" + string + "' is not valid. It must be between " + minChars + " and " + maxChars + " characters")
        }
        return this
    },

    validateDecimal: function(number){
        if(!validator.isDecimal(number)){
            this.errors.push("'" + number + "' is not a valid decimal")
        }
        return this
    },

    validateFloat: function(number){
        if(!validator.isFloat(number)){
            this.errors.push("'" + number + "' is not a valid float")
        }
        return this
    },

    getErrors: function(){
        return this.errors;
    },

    issetErrors: function(){
        return this.errors.length > 0;
    }

}