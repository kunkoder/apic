'use strict'

const { type } = require('os');

const express = require('express'),
      moment = require('moment'),
      crypto = require('crypto'),
      {Auth} = require('../middlewares/Auth'),
      {Upload} = require('../middlewares/Upload'),
      {Job} = require('../models/JobModel'),
      {User} = require('../models/UserModel'),
      {Santri} = require('../models/SantriModel'),
      {Complain} = require('../models/ComplainModel'),
      {Message} = require('../utils/Message'),
      {Export} = require('../utils/Export'),
      {Print} = require('../utils/Print'),
      {Remove} = require('../utils/Remove'),
      router = express.Router(),
      encrypt = password => crypto.createHmac('sha256', process.env.SECRET_KEY).update(password).digest('hex');

router.get('/', Auth.isSuperUser, (req, res) => {
    Complain.allUser((err, complainRows) => {
        let context = {
            title: 'Semua Pengaduan',
            user: req.user,
            complain: complainRows
        };
        res.render('superuser/complain', context);
    });
});

router.get('/complain/delete/:pk', Auth.isSuperUser, (req, res) => {
    Complain.getone('pk', req.params.pk, (err, complainRow) => {
        if(complainRow.attachment) {
            Remove.attachment(complainRow.attachment);
        }
        if(complainRow.letter) {
            Remove.letter(complainRow.letter);
        }
        Complain.del(req.params.pk, () => {
            if(req.user.job != 'Administrator') {
                Message.operatorForward(req.user.name, `menghapus pengaduan dari ${complainRow.name}`);
            }
            req.flash('success', 'pengaduan berhasil dihapus');
            res.redirect('/superuser');
        });
    });
});

router.get('/complain/received', Auth.isSuperUser, (req, res) => {
    Complain.getallUserReceived('sent_to', req.user.job, (err, receivedRows) => {
        Complain.getallUserForwarded('sent_to', req.user.job, (err, forwardedRows) => {
            let context = {
                title: 'Pengaduan Masuk',
                user: req.user,
                complain: receivedRows,
                received: receivedRows.length,
                forwarded: forwardedRows.length
            };
            res.render('superuser/complain', context);
        });
    });
});

router.get('/complain/forwarded', Auth.isSuperUser, (req, res) => {
    Complain.getallUserReceived('sent_to', req.user.job, (err, receivedRows) => {
        Complain.getallUserForwarded('sent_to', req.user.job, (err, forwardedRows) => {
            let context = {
                title: 'Pengaduan Diteruskan',
                user: req.user,
                complain: forwardedRows,
                received: receivedRows.length,
                forwarded: forwardedRows.length
            };
            res.render('superuser/complain', context);
        });
    });
});

router.get('/complain/detail/:pk', Auth.isSuperUser, (req, res) => {
    Complain.getoneUser('pk', req.params.pk, (err, complainRow) => {
        let context = {
            title: 'Detail Pengaduan',
            user: req.user,
            complain: complainRow
        };
        res.render('superuser/complain_detail', context);
    });
});

router.post('/complain/detail', Auth.isSuperUser, Upload.letter, (req, res) => {
    let {pk, name, letter, note} = req.body;
    let complainData = {
        pk: pk,
        letter: letter,
        note: note,
        forwarded_at: moment().format('DD-MM-YYYY HH:mm')
    };
    User.getall('role', 'superuser', (err, userRows) => {
        let emails = userRows.map(item => item.email);
        Message.letterForwarded(emails, req.user.job);
        Complain.put(complainData, () => {
            if(req.user.job != 'Administrator') {
                Message.operatorForward(req.user.name, `meneruskan balasan dari ${name}`);
            }
            req.flash('success', 'balasan diteruskan ke humas');
            res.redirect('/superuser');
        });
    });
});

router.get('/letter/received', Auth.isSuperUser, (req, res) => {
    Complain.allUserForwarded((err, forwardedRows) => {
        Complain.allUserReplied((err, repliedRows) => {
            let context = {
                title: 'Surat Masuk',
                user: req.user,
                forwarded: forwardedRows.length,
                replied: repliedRows.length,
                complain: forwardedRows
            };
            res.render('superuser/letter', context);
        });
    });
});

router.get('/letter/sent', Auth.isSuperUser, (req, res) => {
    Complain.allUserForwarded((err, forwardedRows) => {
        Complain.allUserReplied((err, repliedRows) => {
            let context = {
                title: 'Surat Terkirim',
                user: req.user,
                forwarded: forwardedRows.length,
                replied: repliedRows.length,
                complain: repliedRows
            };
            res.render('superuser/letter', context);
        });
    });
});

router.get('/letter/detail/:pk', Auth.isSuperUser, (req, res) => {
    Complain.getoneUser('pk', req.params.pk, (err, complainRow) => {
        let context = {
            title: 'Detail Surat',
            user: req.user,
            complain: complainRow
        };
        res.render('superuser/letter_detail', context);
    });
});

router.post('/letter/detail', Auth.isSuperUser, (req, res) => {
    let complainData = {
        pk: req.body.pk,
        replied_at: moment().format('DD-MM-YYYY HH:mm')
    };
    Complain.getoneUser('pk', complainData.pk, (err, complainRow) => {
        Message.complainReplied(complainRow.email, complainRow.letter);
        User.getall('job', complainRow.sent_to, (err, userRows) => {
            let emails = userRows.map(item => item.email);
            Message.letterReplied(emails, complainRow.name);
        });
        Complain.put(complainData, () => {
            if(req.user.job != 'Administrator') {
                Message.operatorForward(req.user.name, `mengirim surat balasan ke ${complainRow.email} atas nama ${complainRow.name}`);
            }
            req.flash('success', 'surat terkirim');
            res.redirect('/superuser/letter/received');
        });
    });
});

router.get('/letter/reject/:sent_to/:pk', Auth.isSuperUser, (req, res) => {
    let {sent_to, pk} = req.params;
    sent_to = sent_to.replace(new RegExp('-', 'g'), ' ');
    User.getall('job', sent_to, (err, userRows) => {
        let emails = userRows.map(item => item.email);
        Message.complainRejected(emails);
        let complainData = {
            pk: pk,
            forwarded_at: null
        };
        Complain.put(complainData, () => {
            if(req.user.job != 'Administrator') {
                Message.operatorForward(req.user.name, `mengembalikan surat balasan dari ${sent_to}`);
            }
            req.flash('success', 'email pengembalian surat terkirim');
            res.redirect('/superuser/letter/received');
        });
    });
});

router.get('/account/santri', Auth.isSuperUser, (req, res) => {
    Santri.all((err, santriRows) => {
        let context = {
            title: 'Data Peserta Didik',
            user: req.user,
            santri: santriRows
        }
        res.render('superuser/santri', context);
    });
});

router.post('/account/santri/create', Auth.isSuperUser, (req, res) => {
    let {nis, name, gender, year, grade, mother, father} = req.body;
    let santriData = {
        nis: nis,
        name: name,
        gender: gender,
        year: year,
        grade: grade,
        mother: mother,
        father: father
    };
    Santri.getone('nis', santriData.nis, (err, santriRow) => {
        if(santriRow) {
            req.flash('warning', `peserta didik dengan nis ${santriData.nis} sudah terdaftar`);
            return res.redirect('/superuser/account/santri');
        }
        Santri.add(santriData, () => {
            req.flash('success', 'data peserta didik berhasil ditambahkan');
            res.redirect('/superuser/account/santri');
        });
    });
});

router.post('/account/santri/update', Auth.isSuperUser, (req, res) => {
    let {pk, nis, name, gender, year, grade, mother, father} = req.body;
    let santriData = {
        pk: pk,
        nis: nis,
        name: name,
        gender: gender,
        year: year,
        grade: grade,
        mother: mother,
        father: father
    };
    Santri.put(santriData, () => {
        req.flash('success', 'data peserta didik berhasil diubah');
        res.redirect('/superuser/account/santri');
    });
});

router.get('/account/santri/delete/:pk', Auth.isSuperUser, (req, res) => {
    if(req.user.job != 'Administrator') {
        req.flash('warning', 'menghapus data peserta didik hanya bisa dilakukan oleh administrator');
        return res.redirect('/superuser/account/santri');
    }
    Santri.del(req.params.pk, () => {
        req.flash('success', 'data peserta didik berhasil dihapus');
        res.redirect('/superuser/account/santri');
    });
});

router.get('/account/superuser', Auth.isSuperUser, (req, res) => {
    User.getall('role', 'superuser', (err, superuserRows) => {
        Job.all((err, jobRows) => {
            let jobs = jobRows.map(item => item.job);
            let context = {
                title: 'Data Super User',
                user: req.user,
                superuser: superuserRows,
                job: req.user.job == 'Administrator' ? jobs : jobs.filter(value => !value.includes('Administrator'))
            }
            res.render('superuser/superuser', context);
        });
    });
});

router.post('/account/superuser/create', Auth.isSuperUser, Upload.avatar, (req, res) => {
    let {avatar, name, email, password, job} = req.body;
    User.getone('email', email, (err, userRow) => {
        if(userRow) {
            req.flash('warning', 'email sudah terdaftar, silahkan daftar dengan email lain');
            return res.redirect('/superuser/account/superuser');
        }
        let userData = {
            avatar: avatar,
            name: name,
            email: email,
            role: 'superuser',
            password: encrypt(password),
            token: crypto.randomBytes(32).toString('hex'),
            created_at: moment().format('DD-MM-YYYY HH:mm'),
            job: job
        };
        Message.activateAccount(email, userData.token);
        User.add(userData, () => {
            if(req.user.job != 'Administrator') {
                Message.operatorForward(req.user.name, `menambahkan akun superuser ${email}`);
            }
            req.flash('success', 'data super user berhasil ditambahkan, silahkan cek email untuk aktivasi akun');
            res.redirect('/superuser/account/superuser');
        });
    });
});

router.post('/account/superuser/update', Auth.isSuperUser, Upload.avatar, (req, res) => {
    let {pk, avatar, name, email, job} = req.body;
    User.getone('pk', pk, (err, userRow) => {
        if(email != userRow.email) {
            User.getone('email', email, (err, exist) => {
                if(exist) {
                    req.flash('warning', 'email sudah terdaftar, silahkan pilih email lain');
                    return res.redirect('/superuser/account/superuser');
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
                    req.flash('success', 'data super user berhasil diubah, silahkan cek email untuk aktivasi akun anda');
                    return res.redirect('/superuser/account/superuser');
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
            job: job
        };
        User.put(userData, () => {
            req.flash('success', 'data super user berhasil diubah');
            res.redirect('/superuser/account/superuser');
        });
    });
});

router.get('/account/superuser/delete/:pk', Auth.isSuperUser, (req, res) => {
    User.getone('pk', req.params.pk, (err, userRow) => {
        if(req.user.job != 'Administrator') {
            req.flash('warning', 'menghapus akun super user hanya bisa dilakukan oleh administrator');
            return res.redirect('/superuser/account/superuser');
        }
        if(userRow.avatar) {
            Remove.avatar(userRow.avatar);
        }
        User.del(req.params.pk, () => {
            req.flash('success', 'data super user berhasil dihapus');
            res.redirect('/superuser/account/superuser');
        });
    });
});

router.get('/account/icbsstaff', Auth.isSuperUser, (req, res) => {
    User.getall('role', 'icbsstaff', (err, icbsstaffRows) => {
        Job.all((err, jobRows) => {
            let jobs = jobRows.map(item => item.job);
            let context = {
                title: 'Data Staff ICBS',
                user: req.user,
                icbsstaff: icbsstaffRows,
                job: req.user.job == 'Administrator' ? jobs : jobs.filter(value => !value.includes('Administrator'))
            }
            res.render('superuser/icbsstaff', context);
        });
    });
});

router.post('/account/icbsstaff/create', Auth.isSuperUser, Upload.avatar, (req, res) => {
    let {avatar, name, email, password, job} = req.body;
    User.getone('email', email, (err, userRow) => {
        if(userRow) {
            req.flash('warning', 'email sudah terdaftar, silahkan daftar dengan email lain');
            return res.redirect('/superuser/account/icbsstaff');
        }
        let userData = {
            avatar: avatar,
            name: name,
            email: email,
            role: 'icbsstaff',
            password: encrypt(password),
            token: crypto.randomBytes(32).toString('hex'),
            created_at: moment().format('DD-MM-YYYY HH:mm'),
            job: job
        };
        Message.activateAccount(email, userData.token);
        User.add(userData, () => {
            req.flash('success', 'data staff icbs berhasil ditambahkan, silahkan cek email untuk aktivasi akun');
            res.redirect('/superuser/account/icbsstaff');
        });
    });
});

router.post('/account/icbsstaff/update', Auth.isSuperUser, Upload.avatar, (req, res) => {
    let {pk, avatar, name, email, job} = req.body;
    User.getone('pk', pk, (err, userRow) => {
        if(email != userRow.email) {
            User.getone('email', email, (err, exist) => {
                if(exist) {
                    req.flash('warning', 'email sudah terdaftar, silahkan pilih email lain');
                    return res.redirect('/superuser/account/icbsstaff');
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
                    return res.redirect('/superuser/account/icbsstaff');
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
            job: job
        };
        User.put(userData, () => {
            req.flash('success', 'data staff icbs berhasil diubah');
            res.redirect('/superuser/account/icbsstaff');
        });
    });
});

router.get('/account/icbsstaff/delete/:pk', Auth.isSuperUser, (req, res) => {
    User.getone('pk', req.params.pk, (err, userRow) => {
        if(req.user.job != 'Administrator') {
            req.flash('warning', 'menghapus akun staff icbs hanya bisa dilakukan oleh administrator');
            return res.redirect('/superuser/account/icbsstaff');
        }
        if(userRow.avatar) {
            Remove.avatar(userRow.avatar);
        }
        User.del(req.params.pk, () => {
            req.flash('success', 'data staff icbs berhasil dihapus');
            res.redirect('/superuser/account/icbsstaff');
        });
    });
});

router.get('/account/walisantri', Auth.isSuperUser, (req, res) => {
    User.getall('role', 'walisantri', (err, walisantriRows) => {
        let context = {
            title: 'Data Wali Murid',
            user: req.user,
            walisantri: walisantriRows
        }
        res.render('superuser/walisantri', context);
    });
});

router.post('/account/walisantri/create', Auth.isSuperUser, Upload.avatar, (req, res) => {
    let {avatar, name, email, password, nis} = req.body;
    User.getone('email', email, (err, userRow) => {
        if(userRow) {
            req.flash('warning', 'email sudah terdaftar, silahkan daftar dengan email lain');
            return res.redirect('/superuser/account/walisantri');
        }
        Santri.getone('nis', nis, (err, santriRow) => {
            if(!santriRow) {
                req.flash('warning', 'nis tidak ditemukan');
                return res.redirect('/superuser/account/walisantri');
            }
            let userData = {
                avatar: avatar,
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
                req.flash('success', 'data wali murid berhasil ditambahkan, silahkan cek email untuk aktivasi akun');
                res.redirect('/superuser/account/walisantri');
            });
        });
    });
});

router.post('/account/walisantri/update', Auth.isSuperUser, Upload.avatar, (req, res) => {
    let {pk, avatar, name, email} = req.body;
    User.getone('pk', pk, (err, userRow) => {
        if(email != userRow.email) {
            User.getone('email', email, (err, exist) => {
                if(exist) {
                    req.flash('warning', 'email sudah terdaftar, silahkan pilih email lain');
                    return res.redirect('/superuser/account/walisantri');
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
                    return res.redirect('/superuser/account/walisantri');
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
            res.redirect('/superuser/account/walisantri');
        });
    });
});

router.get('/account/walisantri/delete/:pk', Auth.isSuperUser, (req, res) => {
    User.getone('pk', req.params.pk, (err, userRow) => {
        if(req.user.job != 'Administrator') {
            req.flash('warning', 'menghapus akun wali murid hanya bisa dilakukan oleh administrator');
            return res.redirect('/superuser/account/walisantri');
        }
        if(userRow.avatar) {
            Remove.avatar(userRow.avatar);
        }
        User.del(req.params.pk, () => {
            req.flash('success', 'data wali murid berhasil dihapus');
            res.redirect('/superuser/account/walisantri');
        });
    });
});

router.get('/profile', Auth.isSuperUser, (req, res) => {
    Job.all((err, jobRows) => {
        let jobs = jobRows.map(item => item.job);
        let context = {
            title: 'Profile',
            user: req.user,
            job: req.user.job == 'Administrator' ? jobs : jobs.filter(value => !value.includes('Administrator'))
        };
        res.render('superuser/profile', context);
    });
});

router.post('/profile', Auth.isSuperUser, Upload.avatar, (req, res) => {
    let {pk, avatar, name, email, job} = req.body;
    User.getone('pk', pk, (err, userRow) => {
        if(email != userRow.email) {
            User.getone('email', email, (err, exist) => {
                if(exist) {
                    req.flash('warning', 'email sudah terdaftar, silahkan pilih email lain');
                    return res.redirect('/superuser/profile');
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
                    req.flash('success', 'data super user berhasil diubah, silahkan cek email untuk aktivasi akun anda');
                    return res.redirect('/superuser/profile');
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
            job: job
        };
        User.put(userData, () => {
            req.flash('success', 'data super user berhasil diubah');
            res.redirect('/superuser/profile');
        });
    });
});

router.post('/account/santri/import', Auth.isSuperUser, Upload.santri, (req, res) => {
    req.body.santri.forEach(item => {
        let data = item.data.slice(1);
        for(let i in data) {
            let santriData = {
                nis: data[i][0],
                name: data[i][1],
                gender: data[i][2],
                year: data[i][3],
                grade: data[i][4],
                mother: data[i][5],
                father: data[i][6]
            };
            Santri.getone('nis', santriData.nis, (err, santriRow) => {
                if(santriRow) {
                    return false;
                }
                Santri.add(santriData, err => {
                    if(err) console.log(err);
                });
            });
        }
        req.flash('success', 'data peserta didik berhasil ditambahkan');
        res.redirect('/superuser/account/santri');
    });
});

router.get('/job', Auth.isSuperUser, (req, res) => {
    Job.all((err, jobRows) => {
        let context = {
            title: 'Jabatan',
            user: req.user,
            job: jobRows
        };
        res.render('superuser/job', context);
    });
});

router.post('/job/create', Auth.isSuperUser, (req, res) => {
    let {job} = req.body;
    let jobData = {
        job: job
    };
    Job.getone('job', job, (err, jobRow) => {
        if(jobRow) {
            req.flash('warning', `jabatan dengan nama ${job} sudah terdaftar`);
            return res.redirect('/superuser/job');
        }
        Job.add(jobData, () => {
            req.flash('success', 'jabatan berhasil ditambahkan');
            res.redirect('/superuser/job');
        });
    });
});

router.post('/job/update', Auth.isSuperUser, (req, res) => {
    let {pk, job} = req.body;
    let jobData = {
        pk: pk,
        job: job
    };
    Job.put(jobData, () => {
        req.flash('success', 'jabatan berhasil diubah');
        res.redirect('/superuser/job');
    });
});

router.get('/job/delete/:pk', Auth.isSuperUser, (req, res) => {
    Job.del(req.params.pk, () => {
        req.flash('success', 'jabatan berhasil dihapus');
        res.redirect('/superuser/job');
    });
});

router.post('/account/santri/action', Auth.isSuperUser, (req, res) => {
    if(req.body.remove == '') {
        if(req.user.job != 'Administrator') {
            req.flash('warning', 'menghapus data peserta didik hanya bisa dilakukan oleh administrator');
            return res.redirect('/superuser/account/santri');
        }
        if(!req.body.data) {
            req.flash('warning', 'pilih data untuk dihapus');
            return res.redirect('/superuser/account/santri');
        }
        let removeData = req.body.data;
        if(typeof(removeData) === 'string') {
            Santri.del(removeData, () => {
                req.flash('success', 'data peserta didik berhasil dihapus');
                return res.redirect('/superuser/account/santri');
            });
            return false;
        }
        for(let i of removeData) {
            Santri.del(i, err => {
                if(err) console.log(err);
            });
        }
        req.flash('success', 'data peserta didik berhasil dihapus');
        res.redirect('/superuser/account/santri');
    }
    if(req.body.print == '') {
        if(!req.body.data) {
            req.flash('warning', 'pilih data untuk dicetak');
            return res.redirect('/superuser/account/santri');
        }
        Santri.getmore('pk', req.body.data, (err, santriRows) => {
            for(let i in santriRows) {
                santriRows[i].no = parseInt(i)+1;
            }
            Print.santri(santriRows, () => {
                res.redirect('/uploads/santri/print-peserta-didik.pdf');
            });
        });
    }
    if(req.body.export == '') {
        if(!req.body.data) {
            req.flash('warning', 'pilih data untuk diexport');
            return res.redirect('/superuser/account/santri');
        }
        Santri.getmore('pk', req.body.data, (err, santriRows) => {
            santriRows = santriRows.map(item => [item.nis, item.name, item.gender, item.year, item.grade, item.mother, item.father]);
            santriRows.unshift(['NIS', 'Nama', 'Jenis Kelamin', 'Tahun Masuk', 'Kelas', 'Nama Ibu', 'Nama Ayah']);
            Export.santri(santriRows, () => {
                res.redirect('/uploads/santri/export-peserta-didik.xlsx');
            });
        });
    }
});

router.get('/help', (req, res) => {
    let context = { 
        title: 'Bantuan'
    };
    res.render('superuser/help', context);
});

// router.get('/account/santri/export', Auth.isSuperUser, (req, res) => {
//     Santri.all((err, santriRows) => {
//         santriRows = santriRows.map(item => [item.nis, item.name, item.gender, item.year, item.grade, item.mother, item.father]);
//         santriRows.unshift(['NIS', 'Nama', 'Jenis Kelamin', 'Tahun Masuk', 'Kelas', 'Nama Ibu', 'Nama Ayah']);
//         Export.santri(santriRows, () => {
//             res.redirect('/uploads/santri/export-santri.xlsx');
//         });
//     });
// });

// router.get('/account/santri/print', Auth.isSuperUser, (req, res) => {
//     Santri.all((err, santriRows) => {
//         for(let i in santriRows) {
//             santriRows[i].no = parseInt(i)+1;
//         }
//         Print.santri(santriRows, () => {
//             console.log(santriRows);
//             res.redirect('/uploads/santri/print-santri.pdf');
//         });
//     });
// });

module.exports = router;