'use strict'
const fs = require('fs');

exports.Remove = {
    avatar: file => {
        fs.unlink('./static/uploads/avatar/' + file, error => {
            if(error) {
                console.log(error);
            }
        });
    },
    attachment: file => {
        fs.unlink('./static/uploads/attachment/' + file, error => {
            if(error) {
                console.log(error);
            }
        });
    },
    letter: file => {
        fs.unlink('./static/uploads/letter/' + file, error => {
            if(error) {
                console.log(error);
            }
        });
    }
}