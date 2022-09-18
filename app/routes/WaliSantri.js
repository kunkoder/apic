'use strict'
const express = require('express'),
      moment = require('moment'),
      crypto = require('crypto'),
      {Auth} = require('../middlewares/Auth'),
      {Form} = require('../middlewares/Form'),
      {Upload} = require('../middlewares/Upload'),
      {User} = require('../models/UserModel'),
      {Job} = require('../models/JobModel'),
      {Complain} = require('../models/ComplainModel'),
      {Message} = require('../utils/Message'),
      {Timer} = require('../utils/Timer'),
      router = express.Router();

router.get('/', Auth.isWaliSantri, (req, res) => {
    Job.all((err, jobRows) => {
        let jobs = jobRows.map(item => item.job);
        let context = {
            title: 'Wali Murid',
            user: req.user,
            category: ['Saran', 'Keluhan', 'Lainnya'],
            job: req.user.job == 'Administrator' ? jobs : jobs.filter(value => !value.includes('Administrator'))
        };
        res.render('walisantri/index', context);
    });
});

router.post('/', Auth.isWaliSantri, Form.complain, Upload.attachment, (req, res) => {
    let {title, category, location, time, sent_to, attachment, content} = req.body;
    let complainData = {
        fk_walisantri: req.user.pk,
        title: title,
        category: category,
        location: location,
        time: time,
        sent_to: sent_to,
        attachment: attachment,
        content: content,
        received_at: moment().format('DD-MM-YYYY HH:mm')
    };
    Message.complainSent(req.user.email, sent_to);
    User.getall('job', sent_to, (err, userRows) => {
        let emails = userRows.map(item => item.email);
        Message.complainReceived(emails, req.user.name);
        Complain.add(complainData, () => {
            Timer.reply(content, emails, req.user.name);
            req.flash('success', 'pesan terkirim, silhakan cek email anda');
            res.redirect('/walisantri');
        });
    });
});

router.get('/profile', Auth.isWaliSantri, (req, res) => {
    let context = {
        title: 'Profile',
        user: req.user
    };
    res.render('walisantri/profile', context);
});

router.post('/profile', Auth.isWaliSantri, Upload.avatar, (req, res) => {
    let {pk, avatar, name, email} = req.body;
    User.getone('pk', pk, (err, userRow) => {
        if(email != userRow.email) {
            User.getone('email', email, (err, exist) => {
                if(exist) {
                    req.flash('warning', 'email sudah terdaftar, silahkan pilih email lain');
                    return res.redirect('/walisantri/profile');
                }
                avatar = avatar == null ? userRow.avatar : avatar;
                let userData = {
                    pk: pk,
                    avatar: avatar,
                    name: name,
                    email: email,
                    token: crypto.randomBytes(32).toString('hex'),
                    verified_at: null,
                    updated_at: moment().format('DD-MM-YYYY HH:mm'),
                };
                Message.activateAccount(email, userData.token);
                User.put(userData, () => {
                    req.flash('success', 'data wali murid berhasil diubah, silahkan cek email untuk aktivasi akun anda');
                    return res.redirect('/walisantri/profile');
                });
            });
            return false;
        }
        avatar = avatar == null ? userRow.avatar : avatar;
        let userData = {
            pk: pk,
            avatar: avatar,
            name: name,
            email: email,
            updated_at: moment().format('DD-MM-YYYY HH:mm'),
        };
        User.put(userData, () => {
            req.flash('success', 'data wali murid berhasil diubah');
            res.redirect('/walisantri/profile');
        });
    });
});

module.exports = router;