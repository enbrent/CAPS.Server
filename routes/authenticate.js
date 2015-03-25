var db = require('./db');
// var passport = require('../app').passport;
// var LocalStrategy = require('passport-local');
var toolkit = require('./toolkit');
var mongoose = require('mongoose')
  , id = mongoose.Types.ObjectId;

module.exports = function(passport, LocalStrategy) {
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        db.User.findById(id, function(err, user) {
            done(err, createPassableUser(user));
        });
    });

    passport.use('login', new LocalStrategy(
        {
            passReqToCallback : true,
            usernameField: 'email'
        }, 
        function(req, username, password, done) {

            console.log("INSIDE LOGIN @ AUTHENTICATE.js");

            db.User.findOne({'email' : username} ,
                function(err, user) {
                    if(err) return returnCall('Error in finding user:login', done(err));
                    if(!user) {
                        return returnCall('User Not found with email ' + username,
                            done(null, false, req.flash('message', 'Invalid email/password combination')));
                    }
                    if(!isValidPassword(user, password)) { // Password isn't encrypted
                        return returnCall('Invalid Password', done(null, false, req.flash('message', 'Invalid email/password combination')));
                    }
                    // Matching email and password. Login success.
                    // Delete password field.
                    user.password = null;
                    delete user.password;
                    return returnCall("Login success", done(null, user));
                });
        }
    ));

    passport.use('register', new LocalStrategy(
        {
            passReqToCallback : true,
            usernameField: 'email'
        }, 
        function(req, username, password, done) {

            console.log("INSIDE SIGNUP @ AUTHENTICATE.js");
            console.log('email: ' + username);
            console.log('password: ' + password);

            // Check if board is already registered.
            db.Device.findOne({'deviceNumber': req.param('deviceNumber')}, function(err, device) {
                if(err) return returnCall('Error in finding device: register', done(err));
                if(device) return returnCall('Device already registered', 
                    done(null, false, req.flash('message', 'Device already registered')));

                // Check if user already exists.
                db.User.findOne({'email': username}, function(err, user) {
                    console.log('here');
                    if(err) {
                        // console.log("Error in Signup: " + err);
                        // return done(err);
                        return returnCall("Error on signup: " + err, done(err));
                    }
                    // Already exists.
                    if(user) {
                        return returnCall('User already exists', done(null, false, req.flash('message', 'Email already registered')));
                    } else {

                        // Doesn't exist yet. Create new device and user.
                        var newDevice = new db.Device();
                        newDevice.deviceNumber = req.param('deviceNumber');
                        newDevice.sensors = {};
                        newDevice.priorities = {};
                        newDevice.isActivated = false;

                        // Save device to db.
                        newDevice.save(function(err) {
                            if(err) {
                                console.log("Error in saving device: " + err);
                                throw err;
                            }
                            var newUser = new db.User();
                            // Set fields.
                            newUser.email =  username;
                            newUser.password = toolkit.encrypt(password);
                            newUser.firstName = req.param('firstName');
                            newUser.lastName = req.param('lastName');
                            newUser.deviceId = id(newDevice._id);
                            newUser.deviceNumber = newDevice.deviceNumber;

                            // Save user to db.
                            newUser.save(function(err) {
                                if(err) {
                                    console.log("Error in saving user: " + err);
                                    throw err;
                                }
                                newUser.password = null;
                                delete newUser.password;
                                return returnCall('User Registration successful', done(null, newUser));
                            });
                        });
                    }
                });
            });
        }
    ));


    var isValidPassword = function(user, password) { 
        return toolkit.encrypt(password) == user.password;
    }

    var createPassableUser = function(user){
        return {
            _id: user._id,
            name: (user.firstName + ' ' + user.lastName),
            email: user.email,
            deviceNumber: user.deviceNumber,
            deviceId : user.deviceId
        }
    }

    var returnCall = function(msg, callback) {
        console.log(msg);
        return callback;
    }
}


