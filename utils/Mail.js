var nodemailer = require('nodemailer');
var gmailPassword = require('../config').GmailPassword;
var mailTemplate = require('../Templates/Mail').init();


module.exports = {

    init: function(){
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'quentin.neyraud@gmail.com',
                pass: gmailPassword
            }
        });
        return this;
    },

    send: function(user){
        this.transporter.sendMail({
            from: 'quentin.neyraud@gmail.com',
            to: user.mail,
            subject: "Tu viens de t'inscrire, valide ton email ✔",
            text: 'Hello world ✔',
            html: mailTemplate.replace(user)
        }, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);

        });
    }
};