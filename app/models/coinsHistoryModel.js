'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

const coinsHistorySchema = new Schema({
    coins: Number,
    usedBy: Schema.Types.ObjectId,
    referredBy: Schema.Types.ObjectId,
    type: Number
}, { timestamps: true, versionKey: false, collection: "coinsHistory"});

module.exports = MONGOOSE.model('coinsHistory', coinsHistorySchema);
