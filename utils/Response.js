module.exports = {

    init: function(res){
        this.res = res;
        this.status = "success";
        this.message = "";
        this.datas = {};
    },

    send: function(datas){
        var response = datas ||
            {
                status: this.status,
                message: this.message,
                datas: this.datas
            };

        this.res.json(response);
    }

};