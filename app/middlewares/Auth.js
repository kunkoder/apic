'use strict'
const {User} = require('../models/UserModel');

exports.Auth = {
    isSuperUser: (req, res, next) => {
        if(!req.session.pk) {
            return res.redirect('/signin');
        }
        User.getone('pk', req.session.pk, (err, userRow) => {
            if(!userRow) {
                req.flash('warning' ,'akun tidak ditemukan');
                return res.redirect('/signin');
            }
            if(userRow.role != 'superuser') {
                req.flash('warning', 'akses tidak diizinkan');
                return res.redirect('/signin');
            }
            req.user = userRow;
            next();
        });
    },
    isWaliSantri: (req, res, next) => {
        if(!req.session.pk) {
            return res.redirect('/signin');
        }
        User.getone('pk', req.session.pk, (err, userRow) => {
            if(!userRow) {
                req.flash('warning' ,'akun tidak ditemukan');
                return res.redirect('/signin');
            }
            if(userRow.role != 'walisantri') {
                req.flash('warning', 'akses tidak diizinkan');
                return res.redirect('/signin');
            }
            req.user = userRow;
            next();
        });
    },
    isIcbsStaff: (req, res, next) => {
        if(!req.session.pk) {
            return res.redirect('/signin');
        }
        User.getone('pk', req.session.pk, (err, userRow) => {
            if(!userRow) {
                req.flash('warning' ,'akun tidak ditemukan');
                return res.redirect('/signin');
            }
            if(userRow.role != 'icbsstaff') {
                req.flash('warning', 'akses tidak diizinkan');
                return res.redirect('/signin');
            }
            req.user = userRow;
            next();
        });
    }
}