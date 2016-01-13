var _ = require('lodash');

module.exports = {


    // Check id keys exist in datas
    // return with errors & datas
    checkKeys : function(datas, keys, cb){

        var errors = []
        var returnDatas = {}

        _.map(keys, function(key){
            if(key in datas){
                returnDatas[key] = datas[key]
            }else{
               errors.push("Missing " + key + " parameter")
            }
        })

        errors = errors.length > 0 ? errors : null

        cb(errors, returnDatas);

    }

}