'use strict';

/********************************
 **** Managing all the services ***
 ********* independently ********
 ********************************/
module.exports = {
    authService: require('./authService'),
    dbService: require('./dbService'),
    // fileUploadService: require('./fileUploadService'),
    sessionService: require('./sessionService'),
    // swaggerService: require('./swaggerService'),
    userService: require('./userService'),
    sendOTP : require('./nodeMailer')
};