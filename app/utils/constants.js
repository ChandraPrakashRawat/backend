'use strict';

const CONFIG = require('../../config')

let CONSTANTS = {};

CONSTANTS.SERVER = {
    ONE: 1
};

CONSTANTS.SERVER_TYPES = {
    API: 'api',
    SOCKET: 'socket'
};

CONSTANTS.AVAILABLE_AUTHS = {
    ADMIN: 'admin',
    USER: 'user',
    ADMIN_USER: 'admin_user',
    ALL: 'all'
};

CONSTANTS.TOKEN_TYPES = {
    LOGIN: 1,
    RESET_PASSWORD_OTP: 2,
};

CONSTANTS.DATABASE_VERSIONS = {
    ONE: 1,
};

CONSTANTS.USER_TYPE = {
    USER: 1,
    ADMIN: 2
};

CONSTANTS.PASSWORD_PATTER_REGEX = /^(?=.{8,})(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$/;
CONSTANTS.EMAIL_REGEX=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
CONSTANTS.NAME_REGEX=/^[a-zA-Z\s]{1,20}[a-zA-Z\s]$/;
CONSTANTS.PHONE_REGEX=/^\+\d{1,3}\d{8,10}$/;

CONSTANTS.NORMAL_PROJECTION = { __v: 0, isDeleted: 0, createdAt: 0, updatedAt: 0 };

CONSTANTS.MESSAGES = require('./messages');

CONSTANTS.SECURITY = {
    JWT_SIGN_KEY: 'fasdkfjklandfkdsfjladsfodfafjalfadsfkads',
    BCRYPT_SALT: 8,
    STATIC_TOKEN_FOR_AUTHORIZATION: '58dde3df315587b279edc3f5eeb98145'
};

CONSTANTS.ERROR_TYPES = {
    DATA_NOT_FOUND: 'DATA_NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    MONGO_EXCEPTION: 'MONGO_EXCEPTION',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    FORBIDDEN: 'FORBIDDEN',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INVALID_MOVE: 'invalidMove'
};

CONSTANTS.LOGIN_TYPES = {
    NORMAL: 1,
    GOOGLE: 2,
    FACEBOOK: 3
};

CONSTANTS.EMAIL_TYPES = {
    WELCOME_EMAIL: 1,
    ICALENDER_EMAIL: 2,
    RESET_PASS_EMAIL: 3,
};

CONSTANTS.EMAIL_SUBJECTS = {
    WELCOME_EMAIL: 'Test email',
    ICALENDER_EMAIL: "Event calender",
    PASSWORD_RESET: "Reset Password OTP",
};

CONSTANTS.EMAIL_CONTENTS = {
    WELCOME_EMAIL: `<p>Hello<span style="color: #3366ff;"></span>,</p><p>This is test Email.</p><p>Regards,<br>Team CuesZ</p>`,
    PASSWORD_RESET: `<p>Hello<span style="color: #3366ff;"> {{user}}</span>,</p><p>Reset password OTP is {{otp}}.</p><p>Regards,<br>Team JITESH</p>`,
    ICALENDER_EMAIL: ""
};

CONSTANTS.AVAILABLE_EXTENSIONS_FOR_FILE_UPLOADS = ['csv', 'png'];

CONSTANTS.GENDER = {
    MALE: "Male",
    FEMALE: "Female",
    OTHERS: "Other"
};

CONSTANTS.bccEmail = "jiteshgoyal02@gmail.com";
CONSTANTS.ccEmail = "jiteshgoyal02@gmail.com";

CONSTANTS.OTP_EXPIRIED_TIME_IN_SECONDS = 300;

CONSTANTS.USER_STATUS = {
    DELETED: 1,
};

CONSTANTS.EMAIL_STATUS = {
    VERIFIED: 1,
    NOT_VERIFIED: 2,
};

CONSTANTS.S3_DEFAULT_IMAGE = "default.png";

CONSTANTS.REDIS_EXPIRE_TIME_IN_SEC = 10800;

module.exports = CONSTANTS;