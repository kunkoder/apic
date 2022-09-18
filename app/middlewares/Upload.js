'use strict'
const path = require('path'),
      crypto = require('crypto'),
      fs = require('fs'),
      xlsx = require('node-xlsx').default,
      {User} = require('../models/UserModel'),
      {Complain} = require('../models/ComplainModel');

exports.Upload = {
    attachment: async (req, res, next) => {
        if(req.files) {
            let size = req.files.attachment.size/1024;
            if(size > 10240) {
                req.flash('warning', 'maksimal ukuran file 10MB');
                return res.redirect('/walisantri');
            }
            req.body.attachment = crypto.randomBytes(32).toString('hex') + path.extname(req.files.attachment.name);
            await req.files.attachment.mv('./static/uploads/attachment/' + req.body.attachment);
        }
        next();
    },
    letter: async (req, res, next) => {
        if(!req.files) {
            req.flash('warning', 'upload surat balasan terlebih dahulu');
            return res.redirect(`/${req.user.role}/complain/detail/${req.body.pk}`);
        }
        if(req.body.pk) {
            Complain.getone('pk', req.body.pk, (err, complainRow) => {
                if(req.files && complainRow.letter) {
                    fs.unlink('./static/uploads/letter/' + complainRow.letter, error => {
                        if(error) {
                            console.log(error);
                        }
                    });
                }
            });
        }
        let size = req.files.letter.size/1024;
        if(size > 10240) {
            req.flash('warning', 'maksimal ukuran file 10MB');
            return res.redirect(`/${req.user.role}/complain/detail/${req.body.pk}`);
        }
        if(req.files.letter.mimetype != 'application/pdf') {
            req.flash('warning', 'upload surat dalam format .pdf');
            return res.redirect(`/${req.user.role}/complain/detail/${req.body.pk}`);
        }
        req.body.letter = crypto.randomBytes(32).toString('hex') + path.extname(req.files.letter.name);
        await req.files.letter.mv('./static/uploads/letter/' + req.body.letter);
        next();
    },
    avatar: async (req, res, next) => {
        if(req.body.pk) {
            User.getone('pk', req.body.pk, (err, userRow) => {
                if(req.files && userRow.avatar) {
                    fs.unlink('./static/uploads/avatar/' + userRow.avatar, error => {
                        if(error) {
                            console.log(error);
                        }
                    });
                }
            });
        }
        if(req.files) {
            let size = req.files.avatar.size/1024;
            if(size > 5120) {
                req.flash('warning', 'maksimal ukuran file 5MB');
                return res.redirect(`/${req.user.role}/profile`);
            }
            req.body.avatar = crypto.randomBytes(32).toString('hex') + path.extname(req.files.avatar.name);
            await req.files.avatar.mv('./static/uploads/avatar/' + req.body.avatar);
        }
        next();
    },
    santri: async (req, res, next) => {
        if(!req.files) {
            req.flash('warning', 'upload file excel terlebih dahulu');
            return res.redirect('/superuser/account/santri');
        }
        await req.files.santri.mv('./static/uploads/santri/import-peserta-didik.xlsx');
        let rows = xlsx.parse(fs.readFileSync('./static/uploads/santri/import-peserta-didik.xlsx'));
        req.body.santri = rows;
        next();
    }
}