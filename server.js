// =================================================================
// get the packages we need ========================================
// =================================================================
var express 	= require('express');
var app         = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var bcrypt = require('bcrypt');
var jwt    = require('jsonwebtoken');


// =================================================================
// Controllers =====================================================
// =================================================================
var User = require('./Controllers/User');
var Wishes = require('./Controllers/Wishes');


// =================================================================
// Utils ===========================================================
// =================================================================
var response = require('./utils/Response');


// =================================================================
// configuration ===================================================
// =================================================================
var config = require('./config.js');
var port = process.env.PORT || 8080;

mongoose.connect(config.database);
app.set('jsonWebTokenSecret', config.jsonWebTokenSecret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// =================================================================
// routes ==========================================================
// =================================================================

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Init Response on all methods, all routes
app.all('/*', function(req, res, next){
    response.init(res);
    next();
});

app.get('/', function(req, res) {
    response.send({
        status: 'success',
        message: 'Hello! The API is at http://localhost:' + port + '/api'
    });
});

// ---------------------------------------------------------
// get an instance of the router for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate

apiRoutes.post('/authenticate', function(req, res) {
    User.authenticate(req.body, function(datas){
        response.send(datas);
    });
});

apiRoutes.post('/user', function(req, res){
    User.create(req.body, function(datas){
        response.send(datas);
    });
});

apiRoutes.get('/', function(req, res) {
    response.send({
        message: 'Welcome !'
    });
});

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use(function(req, res, next) {

    var token = req.body.token || req.query.token || req.headers['authorization'];

    if (token) {
        jwt.verify(token, app.get('jsonWebTokenSecret'), function(err, decoded) {
            if (err) {
                response.send({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        response.res.status(403);
        response.send({
                success: false,
                message: 'No token provided.'
        });
    }
});

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------

apiRoutes.get('/user/:id', function(req, res){
    User.findById(req.params.id, function(datas){
        response.send(datas);
    });
});

apiRoutes.get('/users', function(req, res) {
    User.findAll(function(datas) {
        response.send(datas);
    });
});

apiRoutes.get('/check', function(req, res) {
    res.json(req.decoded);
});

apiRoutes.all('/*', function(req, res, next){

    next();
});

app.use('/api', apiRoutes);

// =================================================================
// start the server ================================================
// =================================================================
app.listen(port);
console.log('Server at http://localhost:' + port);
