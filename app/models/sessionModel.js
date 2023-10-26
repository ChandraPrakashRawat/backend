"use strict";

/************* Modules ***********/
const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;
const { TOKEN_TYPES, USER_TYPE } = require("../utils/constants");

/**************************************************
 ************* Session Model or collection ***********
 **************************************************/
const sessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'users' },
    userType: { type: Number, enum: Object.values(USER_TYPE), default: USER_TYPE.USER },
    tokenType: { type: Number, enum: Object.values(TOKEN_TYPES), default: TOKEN_TYPES.LOGIN },
    token: { type: String },
    tokenExpDate: { type: Date },
}, { timestamps: true, versionKey: false, collection: "sessions" });

sessionSchema.index({ tokenExpDate: 1}, { expireAfterSeconds: 0 });

module.exports = MONGOOSE.model('sessions', sessionSchema);