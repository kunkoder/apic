'use strict'
const {Transporter} = require('../../config/mail');

exports.Message = {
    activateAccount: (email, token) => {
        let data = {
            from: 'Humas ICBS',
            to: email,
            subject: 'Aktivasi Akun APIC',
            html: `<p>Untuk aktivasi akun APIC anda <a href="http://${process.env.DOMAIN}/activate/${email}/${token}">Klik Disini</a></p>`
        };
        Transporter.sendMail(data, (err, info) => {
            console.log(info.response);
        });
    },
    forgotPassword: (email, token) => {
        let data = {
            from: 'Humas ICBS',
            to: email,
            subject: 'Lupa Password Akun APIC',
            html: `<p>Untuk mengubah password akun APIC anda <a href="http://${process.env.DOMAIN}/resetpass/${email}/${token}">Klik Disini</a></p>`
        };
        Transporter.sendMail(data, (err, info) => {
            console.log(info.response);
        });
    },
    complainSent: (email, job) => {
        let data = {
            from: 'Humas ICBS',
            to: email,
            subject: 'Pengaduan terkirim via APIC',
            html: `<p>Pesan berhasil terkirim ke ${job}. Silahkan tunggu balasan dalam waktu 1 X 24 jam</p>`
        };
        Transporter.sendMail(data, (err, info) => {
            console.log(info.response);
        });
    },
    complainReceived: (emails, name) => {
        let data = {
            from: 'Humas ICBS',
            to: emails,
            subject: 'Notifikasi Pengaduan APIC',
            html: `<p>Anda menerima pengaduan baru dari ${name}</p>`
        };
        Transporter.sendMail(data, (err, info) => {
            console.log(info.response);
        });
    },
    complainRejected: (emails) => {
        let data = {
            from: 'Humas ICBS',
            to: emails,
            subject: 'Pengembalian Surat APIC',
            html: `<p>Terdapat kesalahan pada surat anda, silahkan kirim ulang</p>`
        };
        Transporter.sendMail(data, (err, info) => {
            console.log(info.response);
        });
    },
    complainReplied: (email, link) => {
        let data = {
            from: 'Humas ICBS',
            to: email,
            subject: 'Surat Jawaban Pengaduan APIC',
            html: `<p>Surat balasan dapat diunduh di <a href="http://${process.env.DOMAIN}/uploads/letter/${link}">link ini</a></p>`
        };
        Transporter.sendMail(data, (err, info) => {
            console.log(info.response);
        });
    },
    letterDeadline: (emails, name) => {
        let data = {
            from: 'Humas ICBS',
            to: emails,
            subject: 'Notifikasi Deadline APIC',
            html: `<p>Segera jawab pengaduan baru dari ${name} sekarang juga</p>`
        };
        Transporter.sendMail(data, (err, info) => {
            console.log(info.response);
        });
    },
    letterForwarded: (emails, job) => {
        let data = {
            from: 'Humas ICBS',
            to: emails,
            subject: 'Notifikasi Pengaduan APIC',
            html: `<p>Anda menerima jawaban pengaduan dari ${job}</p>`
        };
        Transporter.sendMail(data, (err, info) => {
            console.log(info.response);
        });
    },
    letterReplied: (emails, name) => {
        let data = {
            from: 'Humas ICBS',
            to: emails,
            subject: 'Notifikasi Pengaduan APIC',
            html: `<p>Surat anda telah terkirim ke ${name}</p>`
        };
        Transporter.sendMail(data, (err, info) => {
            console.log(info.response);
        });
    },
    operatorForward: (name, action) => {
        let data = {
            from: 'Operator Humas ICBS',
            to: 'humaskominfoics@gmail.com',
            subject: 'Pemberitahuan Aktivitas Operator',
            html: `<p>${name} ${action}</p>`
        };
        Transporter.sendMail(data, (err, info) => {
            console.log(info.response);
        });
    }
}