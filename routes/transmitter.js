var nodemailer = require('nodemailer')
  , models = require('./db')
  , emitter = require('./emitter');

// create reusable transport method (opens pool of SMTP connections)
var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "brent.capsdevice@gmail.com",
        pass: "i am king yo"
    }
});

exports.sendConfirmationEmail = function(email, confirmToken) {

    // var activationLink = 'https://mus.ec/verify/' + confirmToken;
    var activationLink = 'http://caps.pagekite.me/verify/' + confirmToken;

    var htmlMsg = '<div style="font-size:16px"><b>Welcome to myCAPS!</b></div>' +
                    '<br>' +
                    '<div>Please confirm your email below:</div>' +
                    '<div><a href=' + activationLink + '>Activate my account</a></div>' +
                    '<br>' +
                    '<div style="font-size:12px">Note: This link will expire in 10 minutes. Please register again if it becomes invalid.</div>';

    var mailOptions = {
        from: "Brent Enriquez <brent.capsdevice@gmail.com>", 
        to: email, 
        subject: "Registration Confirmation for myCAPS", 
        html: htmlMsg 
    }

    // Send email.
    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }

    });

}

exports.sendResetPasswordEmail = function(email, resetToken) {

    // var resetLink = 'https://mus.ec/reset/' + resetToken;
    var resetLink = 'http://caps.pagekite.me/reset/' + resetToken;

    var htmlMsg = '<div style="font-size:16px"><b>Password reset for CAPS Device</b></div>' +
                    '<br>' +
                    '<div>Please click the link below to reset your password:</div>' +
                    '<div><a href=' + resetLink + '>Reset my password</a></div>';

    mailOptions = {
        from: "Brent Enriquez <brent.capsdevice@gmail.com>", // sender address
        to: email, // list of receivers
        subject: "Reset password request for myCAPS", // Subject line
        html: htmlMsg // html body
    }

    transporter.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{

            console.log("Message sent: " + response.message);
        }
    });  

}

// Twilio Credentials 
var accountSid = 'AC3d78ab39ab36ec6d03c2b4100ab1be42'; 
var authToken = '713ab9cea3304d485ff4b3c23cf12276'; 
var phoneNumber = "+15125806512";

exports.sendAlertText = function(number, toSend, enumber, token) {
    var waitTime = 30000;
     
    //require the Twilio module and create a REST client 
    var client = require('twilio')(accountSid, authToken); 
    //var callUrl = '../public/call.xml';
    //var callUrl = '../other/call.xml';
    // var callUrl = 'http://localhost/call.xml';
    var callUrl = 'http://70dfffd2.ngrok.com/call.xml';
     
    client.messages.create({ 
        to: number, 
        from: phoneNumber, 
        body: toSend,   
    }, function(err, message) { 
        if(err) console.log(err);
        setTimeout(function() {
            console.log("30 seconds elapsed since text, calling");
            // Check if alert is gone
            models.Alert.findOne({'phoneNumber': number, 'isActive': true, 'token': token}, function(err, alert) {
                if(err) return console.log(err);
                if(!alert) return console.log('Error: alert document not found');
                // If alert is still there, initiate call and set alert to inactive.
                client.calls.create({ 
                    url : callUrl,
                    to: enumber, 
                    from: phoneNumber,   
                    method: "GET",  
                    record: "false" 
                }, function(err, call) { 
                    console.log(err);
                    // console.log(call); 
                    return;
                });
                alert.isActive = false;
                alert.status = 'Called emergency number: ' + enumber;
                alert.save(function(err) {
                    if(err) return console.log(err);
                    emitter.emit('alert-update', {userId: alert.deviceNumber, msg: alert.toJSON()});
                })
            });
        }, waitTime);
    });
}

exports.sendDeviceText = function(number, msg) {
    //require the Twilio module and create a REST client 
    var client = require('twilio')(accountSid, authToken); 
    client.messages.create({ 
        to: number, 
        from: phoneNumber, 
        body: msg,   
    }, function(err, message) { 
        if(err) console.log(err);
        return;
    });
}

exports.sendVerifyText = function(number, toSend) {
    //require the Twilio module and create a REST client 
    var client = require('twilio')(accountSid, authToken); 
    client.messages.create({ 
        to: number, 
        from: phoneNumber, 
        body: toSend,   
    }, function(err, message) { 
        if(err) console.log(err);

    });
}


