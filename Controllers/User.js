var UserModel = require('../Models/User');
var Response = require('../utils/Response');
var JwtToken = require('../config.js').jsonWebTokenSecret;
var bcrypt = require('bcrypt');
var jwt    = require('jsonwebtoken');
var validator = require('validator');
var mail = require('../utils/Mail').init();


module.exports = {

    init: function(res){
        Response.init(res);
    },

    authenticate: function(datas, cb){

        userDatas = {
            name: datas.name || null,
            password: datas.password || null
        };


        UserModel.findOne({
            name: userDatas.name
        }, function(err, user) {

            if (err){
                cb({
                    status: 'error',
                    message: 'Error while getting user'
                })
            }

            if (!user) {
                cb({
                    status: 'error',
                    message: 'Authentication failed. User not found.'
                });
            } else if (user) {

                bcrypt.compare(userDatas.password, user.password, function(err, resultat) {
                    if (resultat) {
                        var token = jwt.sign(user, JwtToken, {
                            expiresIn: 1440 // expires in 24 hours
                        });

                        cb({
                            status: 'success',
                            message: 'Token generated',
                            datas: {
                                token: token
                            }
                        });
                    } else {
                        cb({
                            status: 'error',
                            message: 'Authentication failed. Wrong password.'
                        });
                    }
                });
            }

        });
    },

    findById: function(id, cb){
        UserModel.findOne({
            _id: id
        }, function(err, user){
            if(err){
                cb({
                    status: 'error',
                    message: 'Error while getting user'
                });
            }else{
                cb({
                    status: 'success',
                    message: 'user finded',
                    datas: user
                });
            }
        });
    },

    findAll: function(cb){
        UserModel.find({}, function(err, users){
            if(err){
                cb({
                    status: 'error',
                    message: 'Error while getting users'
                })
            }

            cb({
                status: 'success',
                message: 'Request success',
                datas: users
            })
        })
    },

    validate: function(datas, cb){

        var userDatas = {
            name: {},
            contacts: {}
        };
        var errors = [];

        // Validate Firstname
        if(datas.firstName && validator.isAlpha(datas.firstName)){
            userDatas.name.first = datas.firstName.toLowerCase();
        }else{
            errors.push("Prénom non valide");
        }

        // Validate Lastname
        if(datas.lastName && validator.isAlpha(datas.lastName)){
            userDatas.name.last = datas.lastName.toLowerCase();
        }else{
            errors.push("Nom non valide");
        }

        // Validate Password
        if(datas.password && datas.password.length > 7 && datas.password.length < 41){
            userDatas.password = bcrypt.hash(datas.password, 10);
        }else{
            errors.push("Mot de passe non valide, il doit être compris entre 8 et 40 caractères");
        }


        // Validate Mail
        if(datas.mail && validator.isEmail(datas.mail)){
            UserModel.find({
                'contacts.mail': datas.mail
            }, function(err, user){
                console.log(user);
                if(user.length){
                    errors.push("Email déjà utilisé");
                }else{
                    userDatas.contacts.mail = datas.mail;
                }
                cb(errors, userDatas);
            });
        }else{
            errors.push("Email non valide");
            cb(errors, userDatas);
        }
    },

    create: function(datas, cb){
        mail.send();
        this.validate(datas, function(errors, userdatas){
            if(errors.length > 0){
                cb({
                    status: 'error',
                    message: 'Error while creating user, datas issue',
                    datas: errors
                })
            }else{
                var user = new UserModel(userdatas);

                user.save(function(err, user){
                    if(err){
                        cb({
                            status: 'error',
                            message: 'Error while saving user'
                        });
                    }else{
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



};