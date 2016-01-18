var UserModel = require('../Models/User')
var JwtToken = require('../config.js').jsonWebTokenSecret
var bcrypt = require('bcrypt')
var jwt    = require('jsonwebtoken')
var verification = require('../utils/Verification')
var dataValidator = require('../utils/DataValidator')

module.exports = {

    authenticate: function(postDatas, cb){


        verification.checkKeys(postDatas, ['email', 'password'], function(err, postDatas){

            // if missing parameter(s)
            if(err){
                cb({
                    status: 'error',
                    message: 'Missing parameters',
                    datas : err
                })
            }else{

                // Find user by name
                UserModel.findOne({
                    'contact.email': postDatas.email.toLowerCase()
                }, function(err, user) {

                    if (err){
                        cb({
                            status: 'error',
                            message: 'Error while getting user'
                        })
                    }

                    // Name doesn't exist
                    if (!user) {
                        cb({
                            status: 'error',
                            message: 'Authentication failed. User not found.'
                        })
                    } else if (user) {

                        // Compare stored password with POST password
                        bcrypt.compare(postDatas.password, user.account.password, function(err, result) {

                            // Same passwords, return token
                            if (result) {
                                var token = jwt.sign(user, JwtToken, {
                                    expiresIn: 1440 // expires in 24 hours
                                })

                                cb({
                                    status: 'success',
                                    message: 'Token generated',
                                    datas: token
                                })
                            } else {
                                cb({
                                    status: 'error',
                                    message: 'Authentication failed. Wrong password.'
                                })
                            }
                        })
                    }

                })

            }
        })






    },

    findById: function(id, cb){
        UserModel.findById(
            id
        , function(err, user){
            if(err || !user){
                cb({
                    status: 'error',
                    message: 'Error while getting user'
                })
            }else{
                cb({
                    status: 'success',
                    message: 'Get user successful',
                    datas: user
                })
            }
        })
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

                var validator = dataValidator.init()

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
                            })

                            user.save(function (err, user) {
                                if (err) {
                                    cb({
                                        status: 'error',
                                        message: 'Error while saving user'
                                    })
                                } else {
                                    cb({
                                        status: 'success',
                                        message: 'User saved',
                                        datas: {
                                            id: user._id
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            }}
        )

    }



}