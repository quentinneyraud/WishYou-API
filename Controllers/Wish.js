var WishModel = require('../Models/Wish')
var verification = require('../utils/Verification')
var dataValidator = require('../utils/DataValidator')
var _ = require('lodash')

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
            })
    },

    findByPosition: function(queryParams, cb){
        var _self = this

        verification.checkKeys(queryParams, ['latitude', 'longitude', 'distance'], function(err, queryParams){

            if(err){
                cb({
                    status: 'error',
                    message: 'Missing parameters',
                    datas: err
                })
            }else{

                var validator = dataValidator.init()

                if(validator.validateFloat(queryParams.latitude)
                        .validateFloat(queryParams.longitude)
                        .validateDecimal(queryParams.distance)
                        .issetErrors()) {

                    cb({
                        status: 'error',
                        message: 'Errors in query datas',
                        datas: validator.getErrors()
                    })
                }else{
                    // earth radius * 1000(for km)
                    var earthR = 6371*1000
                    var latitude = {
                        degree: queryParams.latitude,
                        radian: _self.degreeToRadian(queryParams.latitude),
                    }
                    var longitude = {
                        degree: queryParams.longitude,
                        radian: _self.degreeToRadian(queryParams.longitude),
                    }
                    var distance = queryParams.distance
                    var latitudeDistanceRadian = distance/earthR
                    var longitudeDistanceRadian = distance/earthR/Math.cos(latitude.radian)

                    var requestParams = {
                        latMax: _self.radianToDegree(latitude.radian + latitudeDistanceRadian),
                        latMin: _self.radianToDegree(latitude.radian - latitudeDistanceRadian),
                        longMax: _self.radianToDegree(longitude.radian + longitudeDistanceRadian),
                        longMin: _self.radianToDegree(longitude.radian - longitudeDistanceRadian),
                    }



                    // Generate random in Annecy
                    //var test = new WishModel({
                    //    latitude: Math.random() * (45.94 - 45.88) + 45.88,
                    //    longitude: Math.random() * (6.18 - 6.05) + 6.05
                    //})
                    //
                    //test.save(function(err,user){
                    //    if(err){
                    //        console.log(err)
                    //    }
                    //})

                    // Find between square around user
                    WishModel.find({
                        latitude: {
                            $gte: requestParams.latMin,
                            $lte: requestParams.latMax
                        },
                        longitude: {
                            $gte: requestParams.longMin,
                            $lte: requestParams.longMax
                        }
                    }, function(err, wishes){
                        if(err){
                            cb({
                                status: 'error',
                                message: 'Error while getting wishes'
                            })
                        }

                        // Add distance
                        var results = _.map(wishes, function(wish){

                            var wishLat = _self.degreeToRadian(wish.latitude)

                            var deltaLat = _self.degreeToRadian(latitude.degree - wish.latitude)
                            var deltaLong = _self.degreeToRadian(longitude.degree - wish.longitude)

                            var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                                Math.cos(latitude.radian) * Math.cos(wishLat) *
                                Math.sin(deltaLong/2) * Math.sin(deltaLong/2)
                            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

                            return {
                                latitude: wish.latitude,
                                longitude: wish.longitude,
                                distance: earthR*c
                            }
                        })

                        // Get if distance < required distance
                        results = _.filter(results, function(result){
                            return result.distance < distance
                        })

                        // sort by distance
                        results = _.sortBy(results, function(result){
                            return result.distance
                        })


                        cb({
                            status: 'success',
                            message: 'Getting wishes success',
                            datas: results
                        })
                    })

                }
            }
        })
    },

    radianToDegree: function(radian){
        return radian*180/Math.PI
    },

    degreeToRadian: function(degree){
        return degree*Math.PI/180
    }



}