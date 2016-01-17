module.exports = {

    init: function(res){
        this.res = res;
    },

    send: function(datas){
        this.res.json({
            status: datas.status || 'error',
            message: datas.message || 'not specified',
            datas: datas.datas || {}
        });
    }

};