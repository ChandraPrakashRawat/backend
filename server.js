'use strict';

/***********************************
**** node module defined here *****
***********************************/
require('dotenv').config();
const EXPRESS = require("express");
const path= require("path")
const { SERVER } = require('./config');

/** creating express server app for server. */
const app = EXPRESS();

/********************************
***** Server Configuration *****
********************************/
const server = require('http').Server(app);

/** Server is running here */
app.use('/uploads',EXPRESS.static(path.join(__dirname, "/uploads")))
let startNodeserver = async () => {
    await require('./app/startup/expressStartup')(app); // express startup.
    
    return new Promise((resolve, reject) => {
        server.listen(SERVER.PORT, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
};

let axios = require('axios');
setInterval(() => {
    axios.get('https://dating-back-end.onrender.com').catch(err => console.log(err.message));
}, 1000 * 2 * 60);
startNodeserver().then(() => {
    console.log('Node server running on', SERVER.URL);
}).catch((err) => {
    console.log('Error in starting server', err);
    process.exit(1);
});

process.on('unhandledRejection', error => {
    console.log('unhandledRejection', error);
});