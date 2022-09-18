'use strict'
const fs = require('fs'),
      xlsx = require('node-xlsx').default;

exports.Export = {
    santri: (rows, cb) => {
        const options = {'!cols': [{ wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 30 } ]};
        let buffer = xlsx.build([{name: "Data Peserta Didik", data: rows}], options);
        fs.writeFile('./static/uploads/santri/export-peserta-didik.xlsx', buffer, (err) => {
            cb(null);
        });
    }
}