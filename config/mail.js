'use strict'
const nodemailer = require('nodemailer');

exports.Transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});