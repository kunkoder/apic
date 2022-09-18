'use strict'
const {Connector} = require('../../config/database');

exports.Santri = {
    add: async (row, cb) => {
        let sql = `INSERT INTO santri SET ?`;
        await Connector.promise().query(sql, row);
        cb(null);
    },
    all: async cb => {
        let sql = `SELECT * FROM santri`;
        const [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    },
    put: async (col, cb) => {
        let sql = `UPDATE santri SET ? WHERE pk=${col['pk']}`;
        await Connector.promise().query(sql, col);
        cb(null);
    },
    del: async (pk, cb) => {
        let sql = `DELETE FROM santri WHERE pk='${pk}'`;
        await Connector.promise().query(sql);
        cb(null);
    },
    getone: async (col, val, cb) => {
        let sql = `SELECT * FROM santri WHERE ${col}='${val}'`;
        let [row] = await Connector.promise().query(sql);
        cb(null, row[0]);
    },
    getall: async (col, val, cb) => {
        let sql = `SELECT * FROM santri WHERE ${col}='${val}'`;
        let [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    },
    getmore: async (col, val, cb) => {
        let sql = `SELECT * FROM santri WHERE ${col} IN (${val})`;
        let [rows] = await Connector.promise().query(sql);
        cb(null, rows);
    }
}