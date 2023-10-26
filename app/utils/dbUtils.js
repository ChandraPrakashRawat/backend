'use strict';

const CONSTANTS = require('../utils/constants');

let dbUtils = {};

/**
* function to check valid reference from models.
*/
dbUtils.checkValidReference = async (document, referenceMapping) => {
    for (let key in referenceMapping) {
        let model = referenceMapping[key];
        if (!!document[key] && !(await model.findById(document[key]))) {
            throw CONSTANTS.RESPONSE.ERROR.BAD_REQUEST(key + ' is invalid.');
        }
    }
};

module.exports = dbUtils;