'use strict'
const {Complain} = require('../models/ComplainModel'),
      {Message} = require('./Message');

exports.Timer = {
    reply: (content, emails, name) => {
        setTimeout(() => {
            Complain.getone('content', content, (err, row) => {
                if(!row.forwarded_at) {
                    Message.letterDeadline(emails, name);
                }
            });
        }, 86400000);
    }
}
