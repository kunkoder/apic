'use strict'
const fs = require('fs'),
      pdf = require('pdf-creator-node');

exports.Print = {
    santri: (rows, cb) => {
        const html = fs.readFileSync('./static/html/print.html', 'utf8');
            //   header = fs.readFileSync('./static/html/print_header.html', 'utf8'),
            //   footer = fs.readFileSync('./static/html/print_footer.html', 'utf8');
        let options = {
            format: 'A4',
            orientation: 'portrait',
            border: '10mm'
            // header: {
            //     height: '40mm',
            //     contents: header
            // },
            // footer: {
            //     height: '25mm',
            //     contents: footer 
            // }
        };
        let document = {
            html: html,
            data: {santri: rows},
            path: './static/uploads/santri/print-peserta-didik.pdf'
        };
        pdf.create(document, options).then(response => {
            cb(null);
        }).catch(error => {
            console.log(error);
        });
    }
}