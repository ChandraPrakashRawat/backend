'use strict';

/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { USER_TYPE, USER_STATUS, EMAIL_STATUS } = require("../utils/constants");

/************* User Model ***********/
const userSchema = new Schema({
    name: { type: String },
    userName: { type: String },
    email: { type: String },
    phone: { type: String },
    password: { type: String },
    referral_code: { type: String },
    userType: { type: Number, enum: Object.values(USER_TYPE), default: USER_TYPE.USER },
    coins: { type: Number, default: 0 },
    lastCollectedDate: Date,
    isDeleted: { type: Boolean },
    adminCoins: { type: Number, default: 0 }
}, { timestamps: true, versionKey: false, collection: "users" });

module.exports = MONGOOSE.model('users', userSchema);
