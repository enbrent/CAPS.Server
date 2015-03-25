var express = require('express')
  , router = express.Router()
  , passport = require('passport')
  , models = require('./db')
  , toolkit = require('./toolkit')
  , transmitter = require('./transmitter')
  , shortId = require('shortid');

var mongoose = require('mongoose')
  , toId = mongoose.Types.ObjectId;

var get = router.get = {}
  , post = router.post = {}
  , $ = {
    db : "",
    passport: ""
  };

// -----------------------------------------------------------
// Get
// -----------------------------------------------------------
get.debug = function(req, res) {
    res.render('debug', { title: 'Debug page' });
}


get.index = function(req, res) {
	res.render('index', { title: 'CAPS Login' , message: req.flash('message')});
};

get.home = function(req, res) {
    models.User.findById(req.user._id, function(err, user) {
        if(err) return res.send(err);
        models.Device.findById(user.deviceId, function(err, device) {
            if(err) return res.send(err);
            res.render('home', {
                title: 'CAPS Manager',
                user: user,
                device: device
            });
        });
    });  
}

get.register = function(req, res) {
	res.render('register', { title: 'CAPS Registration' , message: req.flash('message')});
};

// Might change this later to a post
get.resetpass = function(req, res) {

    var email = req.user.email
      , resetToken = shortId.generate();

    if(!email) return res.send('Error: email not found');

    var rToken = new models.ResetToken();
    rToken._id = resetToken;
    rToken.userId = toId(req.user._id);

    if(!rToken.userId) return res.send('must be logged in');

    rToken.save(function(err) {
        if(err) return res.send(err);
    })

    transmitter.sendResetPasswordEmail(email, resetToken)

    res.render('redirect', { message: "Reset password email sent!" });
}

get.reset = function(req, res) {
    var token = req.url.substring('reset/');

    token = token.substring('/reset/'.length);
    console.log('token: ' + token);

    models.ResetToken.findById(token, function(err, token) {
        if(err) return res.send('error in validating reset link');
        if(!token) return res.send('reset link expired/invalid');

        models.User.findById(token.userId, function(err, user) {
            if(err) return res.send('error in finding user for pass reset');
            if(!user) return res.send('Error: user cant be found');

            req.login(user, function(err) {
                if(err) return res.send(err);
            });

            // Go to reset pass page
            return res.render('changepass');
        });

    });
}

get.logoff = function(req, res) {
    req.logout();
    res.redirect('/');
};

get.verify = function(req, res) {
    res.send('verify');
}

get.textin = function(req, res) {
    res.type('text/xml');
    console.log('text message received');
    res.send('<Response><Say>Hello there! Thanks for calling.</Say></Response>');
}

// -----------------------------------------------------------
// Debug functions
// -----------------------------------------------------------

get.genconfirm = function(req, res) {

    var token = shortId.generate();

    var cToken = new models.ConfirmToken();
    cToken._id = token;

    cToken.save(function(err) {
        if(err) return res.send(err);
        res.send('Confirm token generated');
    })
}

get.genreset = function(req, res) {

    var token = shortId.generate();

    var rToken = new models.ResetToken();
    rToken._id = token;
    rToken.userId = toId(req.user._id);

    if(!rToken.userId) return res.send('must be logged in');

    rToken.save(function(err) {
        if(err) return res.send(err);
        res.send('Reset token generated');
    })
}

// -----------------------------------------------------------
// Board functions
// -----------------------------------------------------------
/*********************
 QUERY: localhost/rgs?id=capstestdevice&s0=temp&s1=cap&count=2
 QUERY: localhost/rgs?id=capstestdevice&s0=cap&count=1
 DB:
 First time query:
 sensors : 
 {
     s0 = "temp",
     s1 = "cap"
 },
 priorities : 
 {
     "temp" = 0,
     "cap" = 0
 }
********************/

get.rgs = function(req, res) {

    console.log(req.query);
    // Check if board is registered.
    var deviceNumber = req.query.id;
    models.Device.findOne({'deviceNumber': deviceNumber}, function(err, device) {
        if(err) return res.send('Error on finding registered device');
        if(!device) return res.send('Device is not registered');

        var m_device = device.toJSON(); // Mongoose doesn't return JSON
        var sensors = {} // We will replace this every request
          , priorities = priorities_o = m_device.priorities // Only update
          , numSensor = parseInt(req.query.count);        

        // Do this because toJSON() sets {} to undefined.
        sensors = sensors ? sensors : {};
        priorities = priorities ? priorities : {};

        priorities_o = toolkit.clone(priorities);

        // Set all sensors to removed-state.
        for(key in priorities) {
            if(priorities.hasOwnProperty(key)) {
                priorities[key] = -1;
            }
        }

        console.log(priorities);
        console.log(priorities_o)

        // Parse sensors from query. 
        for(var i = 0; i < numSensor; i += 1) {
            var sNum = 's' + i.toString();
            var sensor = req.query[sNum];
            // Map sensor-name.
            if(sensor) {
                sensors[sNum] = sensor;
                // If priority doesn't exist/removed-state, set to 0.
                priorities[sensor] = priorities_o[sensor] ? 
                priorities_o[sensor] == -1 ? 0 : priorities_o[sensor] : 
                0;
            }
        }

        console.log(priorities);

        // Sort priorities for shifting.
        var p_array = []
          , f_array = [];

        // Get values.
        for(var sensor in priorities) {
            p_array.push([sensor, priorities[sensor]]);
        }

        p_array.sort(function(a,b) { return a[1]-b[1]} );

        var pr = 0;
        for(var i = 0; i < p_array.length; i += 1) {
            // Remove "removed-state" sensors (AKA the ones not requested).
            if(p_array[i][1] != -1) { 
                // Shift priorities: temp=1, cap=3 --> temp=1, cap=2
                p_array[i][1] = p_array[i][1] != pr ? ++pr : pr;
                f_array.push(p_array[i]);
                // Update actual priority object.
                priorities[p_array[i][0]] = p_array[i][1];
            }
        }

        // Update device document in db.
        device.sensors = sensors;
        device.priorities = priorities;
        device.isActivated = true;
        device.save(function(err) {
            if(err) return res.send('Error on updating device');
        })

        // Construct response.
        var response = "";

        for(var i = 0; i < numSensor; i += 1) {
            var sNum = "s" + i.toString();
            response += i + "=" + priorities[sensors[sNum]];
            if(i != numSensor - 1) { response += ":"; }
        }

        if(device.sensors == null) res.send(0);
        else res.send(response);
    });
};

/*********************
 QUERY: localhost/alert?id=capsdevicetest&sensor=s0
********************/
get.alert = function(req, res) {
    // Check if board is registered
    var deviceNumber = req.query.id;
    models.Device.findOne({'deviceNumber':deviceNumber}, function(err, device) {
        if(err) return res.send('Error in finding registered device');
        if(!device) return res.send('Device not registered');
        // Get the phone number from user.
        models.User.findOne({'deviceNumber':deviceNumber}, function(err, user) {
            if(err) return res.send('Error in finding user');
            if(!user) return res.send('User not found');
            // Get sensor name and priority
            var sensor = device.sensors[req.query.sensor]
              , priority = device.priorities[sensor];
            if(!sensor) return res.send('Error in getting sensor');
            if(priority <= 0) return res.send('Sensor does not exist/turned off');
            message = 'This is a CAPS Device alert. Your ' + sensor +' sensor has picked up something inside your car.';
            transmitter.sendAlertText(user.phoneNumber, message);
            res.send('Text message sent');
        });
        
    });
}
// -----------------------------------------------------------
// Post
// -----------------------------------------------------------
post.login = passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true
});

post.register = passport.authenticate('register', {
    successRedirect: '/home',
    failureRedirect: '/register',
    failureFlash: true
});

post.changepass = function(req, res) {
    var newpw = req.body.password
      , userId = req.user._id;

    newpw = toolkit.encrypt(newpw);

    console.log('newpw: ' + newpw);
    console.log('id: ' + userId);

    models.User.findById(userId, function(err, user) {
        if(err) return res.send('Error in finding user');
        if(!user) return res.send('Error: user not found');

        user.password = newpw;
        user.save(function(err) {
            if(err) return res.send('Error in changing password');
            res.send('password changed!');
        })

    })
}

post.changepriority = function(req, res) {
    if(!req.user) return res.send('Error: cant find user');

    var new_p = req.body.priority;

    models.Device.findById(req.user.deviceId, function(err, device) {
        if(err) return res.send(err);
        if(!device) return res.send('Error: device not found');
        if(Object.keys(device.sensors).length != new_p.length) return res.send('Error: number of sensors does not match');

        var _device = device.toJSON();
        var _priority = _device.priorities;

        for(var i = 0; i < new_p.length; i += 1) {
            var key = 's' + i.toString();
            var sensor = device.sensors[key];
            // Default means priority didn't change. If so, use old value.
            _priority[sensor] = new_p[i] == 'default' ? _priority[sensor] : new_p[i];
        }
        
        device.priorities = _priority;
        device.save(function(err) {
            if(err) return res.send(err);
            res.redirect('/home');
        })
    });
}

/**************************************************************
* ANDROID ROUTES
**************************************************************/

/**
* Login Authentication
* params: { email, password } **password isn't encrypted yet
* testquery-ne: localhost/logina?email=benriquez12@ymail.com&password=123456
* --
* checks if login fields are correct
* IF (correct) return user/device priority info
* ELSE return null 
*/
get.logina = function(req, res) {
    var email = req.query.email
      , password = req.query.password;

    console.log(req.query);
    console.log(req.params);
    console.log(req.body);

    // var n = 100000000;
    // while(n-- > 0){
    //     console.log(n);
    // }

    if(!email || !password) return res.send({});

    console.log(email);
    console.log(password);

    var response = {};

    models.User.findOne({'email' : email, 'password' : toolkit.encrypt(password)}, function(err, user) {
        if(err) return res.send({'error' : 'error in finding user'});
        if(!user) return res.send({});
        
        // Bind user to response.
        response.user = user;
        models.Device.findById(user.deviceId, function(err, device) {
            if(err) return res.send({'error' : 'error in finding device'});
            if(!device) return res.send({});

            // Bind device to response.
            response.device = device;
            console.log(response);

            res.send(response);
        });

    });
}


var getUserInfo = function(req, res) {

};

// -----------------------------------------------------------
// Other
// -----------------------------------------------------------
router.configure = function(callback) {
    callback();
}

router.set = function(prop, value) {
    $[prop] = value;
}

module.exports = router;
