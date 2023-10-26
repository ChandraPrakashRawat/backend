'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const fixedCoinsSchema = new Schema({
    dailyPoints: Number,
    referPoints: Number,
    footer: String,
    about: String,
    appName: String,
    address: String,
    termsAndConditions:String,
    privacyAndPolicy:String
}, { timestamps: true, versionKey: false, collection: "fixedCoins"});

module.exports = MONGOOSE.model('fixedCoins', fixedCoinsSchema);
