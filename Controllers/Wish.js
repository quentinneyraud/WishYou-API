var WishModel = require('../Models/Wishes');
var verification = require('../utils/Verification');
var dataValidator = require('../utils/DataValidator');

module.exports = {

    findById: function(id, cb){
        WishModel.findById(
            id
            , function(err, wish){
                if(err || !wish){
                    cb({
                        status: 'error',
                        message: 'Error while getting wish'
                    })
                }else{
                    cb({
                        status: 'success',
                        message: 'Get wish successful',
                        datas: wish
                    })
                }
            });
    },

    create: function(datas, cb){

        verification.checkKeys(datas, ['firstName', 'lastName', 'password', 'email'], function(err, postDatas){

            // if missing parameter(s)
            if(err){
                cb({
                    status: 'error',
                    message: 'Missing parameters',
                    datas : err
                })
            }else {

                var validator = dataValidator.init();

                if (validator.validateString(postDatas.firstName, 3, 40)
                        .validateString(postDatas.lastName, 3, 40)
                        .validateLength(postDatas.password, 8, 40)
                        .validateEmail(postDatas.email)
                        .issetErrors()) {

                    cb({
                        status: 'error',
                        message: 'Errors in POST datas',
                        datas: validator.getErrors()
                    })

                } else {
                    UserModel.findOne({
                        'contact.email': postDatas.email
                    }, function (err, user) {
                        if (user) {
                            cb({
                                status: 'error',
                                message: 'Email already used'
                            })
                        } else {
                            var user = new UserModel({
                                contact: {
                                    firstName: postDatas.firstName.toLowerCase(),
                                    lastName: postDatas.lastName.toLowerCase(),
                                    email: postDatas.email.toLowerCase()
                                },
                                account: {
                                    password: bcrypt.hashSync(postDatas.password, 10),
                                    createdAt: Date.now()
                                }
                            });

                            user.save(function (err, user) {
                                if (err) {
                                    cb({
                                        status: 'error',
                                        message: 'Error while saving user'
                                    });
                                } else {
                                    cb({
                                        status: 'success',
                                        message: 'User saved',
                                        datas: {
                                            id: user._id
                                        }
                                    });
                                }
                            })
                        }
                    });
                }
            }}
        )

    }



};