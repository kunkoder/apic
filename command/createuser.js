'use strict'
const dotenv = require('dotenv').config(),
      crypto = require('crypto'),
      moment = require('moment'),
      {User} = require('../app/models/UserModel'),
      {Message} = require('../app/utils/Message'),
      {Connector} = require('../config/database'),
      encrypt = password => crypto.createHmac('sha256', process.env.SECRET_KEY).update(password).digest('hex');

let userData = {
    name: 'gray fullbuster',
    email: 'laught.coffin@gmail.com',
    role: 'superuser',
    password: encrypt('qwerty'),
    token: crypto.randomBytes(32).toString('hex'),
    created_at: moment().format('DD-MM-YYYY HH:mm'),
    job: 'Administrator'
};

User.getone('email', userData.email, (err, userRow) => {
    if(userRow) {
        Connector.end();
        return console.log('email sudah terdaftar, silahkan daftar dengan email lain');
    }
    Message.activateAccount(userData.email, userData.token);
    User.add(userData, () => {
        Connector.end();
        console.log('super user berhasil didaftarkan, silahkan cek email untuk aktivasi akun anda');
    });
});