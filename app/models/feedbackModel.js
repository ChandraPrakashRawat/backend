'use strict';

/************* Modules ***********/
const MONGOOSE = require('mongoose');
const SchemaTypes = require('mongoose');
const Schema = MONGOOSE.Schema;

/************* Feedback Model ***********/
const feedback = new Schema({
    ratting: { type: Number },
    interested: { type: String },
    comment: { type: String, default: undefined },
    userID: { type: SchemaTypes.ObjectId, ref: 'users' },
}, { timestamps: true, versionKey: false, collection: "feedbacks" });

module.exports = MONGOOSE.model('feedbacks', feedback);
