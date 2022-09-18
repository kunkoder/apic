'use strict'
const express = require('express'),
      moment = require('moment'),
      {Auth} = require('../middlewares/Auth'),
      {Upload} = require('../middlewares/Upload'),
      {Job} = require('../models/JobModel'),
      {User} = require('../models/UserModel'),
      {Complain} = require('../models/ComplainModel'),
      {Message} = require('../utils/Message'),
      router = express.Router();

router.get('/', Auth.isIcbsStaff, (req, res) => {
    Complain.getallUserReceived('sent_to', req.user.job, (err, receivedRows) => {
        Complain.getallUserForwarded('sent_to', req.user.job, (err, forwardedRows) => {
            let context = {
                title: 'Pengaduan Masuk',
                user: req.user,
                complain: receivedRows,
                received: receivedRows.length,
                forwarded: forwardedRows.length
            };
            res.render('icbsstaff/complain', context);
        });
    });
});

router.get('/complain/forwarded', Auth.isIcbsStaff, (req, res) => {
    Complain.getallUserReceived('sent_to', req.user.job, (err, receivedRows) => {
        Complain.getallUserForwarded('sent_to', req.user.job, (err, forwardedRows) => {
            let context = {
                title: 'Pengaduan Diteruskan',
                user: req.user,
                complain: forwardedRows,
                received: receivedRows.length,
                forwarded: forwardedRows.length
            };
            res.render('icbsstaff/complain', context);
        });
    });
});

router.get('/complain/detail/:pk', Auth.isIcbsStaff, (req, res) => {
    Complain.getoneUser('pk', req.params.pk, (err, complainRow) => {
        let context = {
            title: 'Detail Pengaduan',
            user: req.user,
            complain: complainRow
        };
        res.render('icbsstaff/complain_detail', context);
    });
});

router.post('/complain/detail', Auth.isIcbsStaff, Upload.letter, (req, res) => {
    let {pk, letter, note} = req.body;
    let complainData = {
        pk: pk,
        letter: letter,
        note: note,
        forwarded_at: moment().format('DD-MM-YYYY HH:mm')
    };
    User.getall('job', 'Kepala Humas Kominfo', (err, userRows) => {
        let emails = userRows.map(item => item.email);
        Message.letterForwarded(emails, req.user.job);
        Complain.put(complainData, () => {
            req.flash('success', 'balasan diteruskan ke humas');
            res.redirect('/icbsstaff');
        });
    });
});

router.get('/profile', Auth.isIcbsStaff, (req, res) => {
    Job.all((err, jobRows) => {
        let jobs = jobRows.map(item => item.job);
        let context = {
            title: 'Profile',
            user: req.user,
            job: req.user.job == 'Administrator' ? jobs : jobs.filter(value => !value.includes('Administrator'))
        };
        res.render('icbsstaff/profile', context);
    });
});

router.post('/profile', Auth.isIcbsStaff, Upload.avatar, (req, res) => {
    let {pk, avatar, name, email, job} = req.body;
    User.getone('pk', pk, (err, userRow) => {
        if(email != userRow.email) {
            User.getone('email', email, (err, exist) => {
                if(exist) {
                    req.flash('warning', 'email sudah terdaftar, silahkan pilih email lain');
                    return res.redirect('/icbsstaff/profile');
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
                    job: job
                };
                Message.activateAccount(email, userData.token);
                User.put(userData, () => {
                    req.flash('success', 'data staff icbs berhasil diubah, silahkan cek email untuk aktivasi akun anda');
                    return res.redirect('/icbsstaff/profile');
                });
            });
            return;
        }
        avatar = avatar == null ? userRow.avatar : avatar;
        let userData = {
            pk: pk,
            avatar: avatar,
            name: name,
            email: email,
            updated_at: moment().format('DD-MM-YYYY HH:mm'),
            job: job
        };
        User.put(userData, () => {
            req.flash('success', 'data staff icbs berhasil diubah');
            res.redirect('/icbsstaff/profile');
        });
    });
});

router.get('/help', (req, res) => {
    let context = { 
        title: 'Bantuan'
    };
    res.render('icbsstaff/help', context);
});

module.exports = router;