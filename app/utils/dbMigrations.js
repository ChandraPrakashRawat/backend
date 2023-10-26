'use strict';

const CONSTANTS = require('./constants');
const MODELS = require('../models');
const { hashPassword } = require('./utils');
const { ADMIN } = require("../../config");
const dbMigrations = {};

/**
 * function to migerate database based on version number.
 */
dbMigrations.migerateDatabase = async () => {

    // get database version.
    let dbVersion = await MODELS.DBVersionModel.findOne({});

    // check if it is initial version then do this to migerate database.
    if (!dbVersion || dbVersion.version < CONSTANTS.DATABASE_VERSIONS.ONE) {
        /** -- add first admin  */
        let saveData = { email: ADMIN.EMAIL, password: hashPassword(ADMIN.PASSWORD), userType: CONSTANTS.USER_TYPE.ADMIN }
        await MODELS.UserModel.findOneAndUpdate({ email: ADMIN.EMAIL }, saveData, { upsert: true, setDefaultsOnInsert: true });
        dbVersion = await MODELS.DBVersionModel.findOneAndUpdate({}, { version: CONSTANTS.DATABASE_VERSIONS.ONE }, { upsert: true, new: true});
    }
};

module.exports = dbMigrations;