var nodemailer = require('nodemailer');

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
    var activationLink = 'http://5b97ed51.ngrok.com/verify/' + confirmToken;

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
    var resetLink = 'http://5b97ed51.ngrok.com/reset/' + resetToken;

    var htmlMsg = '<div style="font-size:16px"><b>Password reset for myCAPS</b></div>' +
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



