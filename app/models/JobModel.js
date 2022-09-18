'use strict'
const {Connector} = require('../../config/database');

exports.Job = {
    add: async (row, cb) => {
        let sql = `INSERT INTO job SET ?`;
        await Connector.promise().query(sql, row);
        cb(null);
    },
    all: async cb => {
        let sql = `SELECT * FROM job`;
        const [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    },
    put: async (col, cb) => {
        let sql = `UPDATE job SET ? WHERE pk=${col['pk']}`;
        await Connector.promise().query(sql, col);
        cb(null);
    },
    del: async (pk, cb) => {
        let sql = `DELETE FROM job WHERE pk='${pk}'`;
        await Connector.promise().query(sql);
        cb(null);
    },
    getone: async (col, val, cb) => {
        let sql = `SELECT * FROM job WHERE ${col}='${val}'`;
        let [row] = await Connector.promise().query(sql);
        cb(null, row[0]);
    },
    getall: async (col, val, cb) => {
        let sql = `SELECT * FROM job WHERE ${col}='${val}'`;
        let [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    }
}