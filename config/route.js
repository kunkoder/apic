'use strict'
const express = require('express'),
      fs = require('fs'),
      router = express.Router();

fs.readdir('./app/routes', (err, files) => {
    files.forEach(file => {
        let url = file == 'Home.js' ? '/' : `/${file.toLowerCase().slice(0, -3)}`;
        router.use(url, require(`../app/routes/${file.slice(0, -3)}`));
    });
    router.get('/*', (req, res) => {
        let context = {
            title: 'Not Found'
        }
        res.render('404', context);
    });
});

module.exports = router;