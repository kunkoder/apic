'use strict'

const express = require('express'),
      visitCounter = require('express-visit-counter').Loader,
      crypto = require('crypto'),
      moment = require('moment'),
      {Form} = require('../middlewares/Form'),
      {User} = require('../models/UserModel'),
      {Santri} = require('../models/SantriModel'),
      {Message} = require('../utils/Message'),
      router = express.Router(),
      encrypt = password => crypto.createHmac('sha256', process.env.SECRET_KEY).update(password).digest('hex');

router.get('/', async (req, res) => { 
    let context = { 
        title: 'Home',
        visitors: await visitCounter.getCount()
    };
    res.render('home/index', context);
});

router.get('/signin', async (req, res) => {
    let context = {
        title: 'Login',
        visitors: await visitCounter.getCount()
    };
    res.render('home/signin', context);
});

router.post('/signin', Form.signin, (req, res) => {
    let {email, password} = req.body;
    User.getone('email', email, (err, userRow) => {
        if(!userRow) {
            req.flash('warning', 'email belum terdaftar');
            return res.redirect('/signin');
        }
        if(!userRow.verified_at) {
            req.flash('warning', 'akun belum diaktivasi, silahkan cek email untuk aktivasi akun anda');
            return res.redirect('/signin');
        }
        if(encrypt(password) != userRow.password) {
            req.flash('warning', 'password salah');
            return res.redirect('/signin');
        }
        req.session.pk = userRow.pk;
        res.redirect(`/${userRow.role}`);
    });
});

router.get('/signup', async (req, res) => {
    let context = {
        title: 'Register',
        visitors: await visitCounter.getCount()
    };
    res.render('home/signup', context);
});

router.post('/signup', Form.signup, (req, res) => {
    let {name, nis, email, password} = req.body;
    User.getone('email', email, (err, userRow) => {
        if(userRow) {
            req.flash('warning', 'email sudah terdaftar, silahkan daftar dengan email lain');
            return res.redirect('/signup');
        }
        Santri.getone('nis', nis, (err, santriRow) => {
            if(!santriRow) {
                req.flash('warning', 'nis tidak ditemukan');
                return res.redirect('/signup');
            }
            let userData = {
                name: name,
                email: email,
                role: 'walisantri',
                password: encrypt(password),
                token: crypto.randomBytes(32).toString('hex'),
                created_at: moment().format('DD-MM-YYYY HH:mm'),
                nis: nis
            };
            Message.activateAccount(email, userData.token);
            User.add(userData, () => {
                req.flash('success', 'wali murid berhasil didaftarkan, silahkan cek email untuk aktivasi akun anda');
                res.redirect('/signin');
            });
        });
    });
});

router.get('/signout', (req, res) => {
    req.session = null;
    res.redirect('/signin');
});

router.get('/activate/:email/:token', (req, res) => {
    let {email, token} = req.params;
    User.getone('email', email, (err, userRow) => {
        if(!userRow) {
            req.flash('warning', 'email belum terdaftar');
            return res.redirect('/signin');
        }
        if(token != userRow.token) {
            req.flash('warning', 'token tidak sesuai');
            return res.redirect('/signin');
        }
        let userData = {
            pk: userRow.pk,
            token: null,
            verified_at: moment().format('DD-MM-YYYY HH:mm'),
            updated_at: moment().format('DD-MM-YYYY HH:mm')
        };
        User.put(userData, () => {
            req.flash('success', 'aktivasi akun berhasil');
            res.redirect('/signin');
        });
    });
});

router.get('/forgotpass', async (req, res) => {
    let context = {
        title: 'Forgot Password',
        visitors: await visitCounter.getCount()
    };
    res.render('home/forgotpass', context);
});

router.post('/forgotpass', Form.forgotPass, (req, res) => {
    let {email} = req.body;
    User.getone('email', email, (err, userRow) => {
        if(!userRow) {
            req.flash('warning', 'email belum terdaftar');
            return res.redirect('/signin');
        }
        if(!userRow.verified_at) {
            req.flash('warning', 'akun belum diaktivasi, silahkan cek email untuk aktivasi akun anda');
            return res.redirect('/signin');
        }
        let userData = {
            pk: userRow.pk,
            token: crypto.randomBytes(32).toString('hex'),
            updated_at: moment().format('DD MMMM YYYY HH:mm')
        };
        Message.forgotPassword(email, userData.token);
        User.put(userData, () => {
            req.flash('success', 'permintaan reset password telah terkirim, silahkan cek email untuk reset password anda');
            res.redirect('/signin');
        });
    });
});

router.get('/resetpass/:email/:token', (req, res) => {
    let {email, token} = req.params;
    User.getone('email', email, async (err, userRow) => {
        if(!userRow) {
            req.flash('warning', 'email belum terdaftar');
            return res.redirect('/signin');
        }
        if(token != userRow.token) {
            req.flash('warning', 'token tidak sesuai');
            return res.redirect('/signin');
        }
        let context = {
            title: 'Reset Password',
            pk: userRow.pk,
            visitors: await visitCounter.getCount()
        };
        res.render('home/resetpass', context);
    });
});

router.post('/resetpass', Form.resetPass, (req, res) => {
    let {pk, password} = req.body;
    let userData = {
        pk: pk,
        password: encrypt(password),
        token: null,
        updated_at: moment().format('DD-MM-YYYY HH:mm')
    };
    User.put(userData, () => {
        req.flash('success', 'reset password berhasil');
        res.redirect('/signin');
    });
});

router.get('/help', async (req, res) => {
    let context = { 
        title: 'Bantuan',
        visitors: await visitCounter.getCount()
    };
    res.render('home/help', context);
});

module.exports = router;