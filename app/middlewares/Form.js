'use strict'

const getKeyByValue = (object, value) => {
    return Object.keys(object).find(key => object[key] === value);
}

exports.Form = {
    signin: (req, res, next) => {
        if(getKeyByValue(req.body, '')) {
            req.flash('warning', 'data tidak boleh kosong');
            return res.redirect('/signin');
        }
        next();
    },
    signup: (req, res, next) => {
        if(getKeyByValue(req.body, '')) {
            req.flash('warning', 'data tidak boleh kosong');
            return res.redirect('/signup');
        }
        if(req.body.password.length < 8 ) {
            req.flash('warning', 'password minimal delapan karakter');
            return res.redirect('/signup');
        }
        next();
    },
    forgotPass: (req, res, next) => {
        if(getKeyByValue(req.body, '')) {
            req.flash('warning', 'data tidak boleh kosong');
            return res.redirect('/forgotpass');
        }
        next();
    },
    resetPass: (req, res, next) => {
        if(getKeyByValue(req.body, '')) {
            req.flash('warning', 'data tidak boleh kosong');
            return res.redirect('/resetpass');
        }
        next();
    },
    complain: (req, res, next) => {
        if(req.body.title == '' || req.body.sent_to == '' || req.body.content == '') {
            req.flash('warning', 'harap lengkapi data yang wajib diisi');
            return res.redirect('/walisantri');
        }
        next();
    }
}