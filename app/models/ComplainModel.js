'use strict'
const {Connector} = require('../../config/database');

exports.Complain = {
    add: async (row, cb) => {
        let sql = `INSERT INTO complain SET ?`;
        await Connector.promise().query(sql, row);
        cb(null);
    },
    all: async cb => {
        let sql = `SELECT * FROM complain`;
        const [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    },
    put: async (col, cb) => {
        let sql = `UPDATE complain SET ? WHERE pk=${col['pk']}`;
        await Connector.promise().query(sql, col);
        cb(null);
    },
    del: async (pk, cb) => {
        let sql = `DELETE FROM complain WHERE pk='${pk}'`;
        await Connector.promise().query(sql);
        cb(null);
    },
    getone: async (col, val, cb) => {
        let sql = `SELECT * FROM complain WHERE ${col}='${val}'`;
        let [row] = await Connector.promise().query(sql);
        cb(null, row[0]);
    },
    getall: async (col, val, cb) => {
        let sql = `SELECT * FROM complain WHERE ${col}='${val}'`;
        let [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    },
    allUser: async cb => {
        let sql = `SELECT u.*, c.* FROM complain c INNER JOIN user u ON c.fk_walisantri=u.pk ORDER BY received_at DESC`;
        let [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    },
    allUserForwarded: async cb => {
        let sql = `SELECT u.*, c.* FROM complain c INNER JOIN user u ON c.fk_walisantri=u.pk WHERE forwarded_at IS NOT NULL AND replied_at IS NULL ORDER BY forwarded_at DESC`;
        let [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    },
    allUserReplied: async cb => {
        let sql = `SELECT u.*, c.* FROM complain c INNER JOIN user u ON c.fk_walisantri=u.pk WHERE replied_at IS NOT NULL ORDER BY replied_at DESC`;
        let [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    },
    getoneUser: async (col, val, cb) => {
        let sql = `SELECT u.*, c.* FROM complain c INNER JOIN user u ON c.fk_walisantri=u.pk WHERE c.${col}='${val}'`;
        let [rows] = await Connector.promise().query(sql);
        cb(null, rows[0]);
    },
    getallUserReceived: async (col, val, cb) => {
        let sql = `SELECT u.*, c.* FROM complain c INNER JOIN user u ON c.fk_walisantri=u.pk WHERE c.${col}='${val}' AND forwarded_at IS NULL ORDER BY received_at DESC`;
        let [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    },
    getallUserForwarded: async (col, val, cb) => {
        let sql = `SELECT u.*, c.* FROM complain c INNER JOIN user u ON c.fk_walisantri=u.pk WHERE c.${col}='${val}' AND forwarded_at IS NOT NULL ORDER BY forwarded_at DESC`;
        let [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    }
}