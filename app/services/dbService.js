'use strict';

const { NORMAL_PROJECTION } = require("../utils/constants");

let dbService = {};

/**
* function to create.
*/
dbService.create = async (model, payload) => {
    return await model.create(payload);
};

/**
* function to insert many.
*/
dbService.insertMany = async (model, payload) => {
    return await model.insertMany(payload);
};

/**
* function to find.
*/
dbService.find = async (model, criteria, projection = {}) => {
    return await model.find(criteria, {...projection, ...NORMAL_PROJECTION}).lean();
};

/**
* function to find one.
*/
dbService.findOne = async (model, criteria, projection = {}) => {
    return await model.findOne(criteria, {...projection, ...NORMAL_PROJECTION}).lean();
};

/**
* function to update one.
*/
dbService.findOneAndUpdate = async (model, criteria, dataToUpdate, projection = {}) => {
    projection.projection = {...projection.projection, ...NORMAL_PROJECTION};
    return await model.findOneAndUpdate(criteria, dataToUpdate, projection).lean();
};

/**
* function to find one and delete.
*/
dbService.findOneAndDelete = async (model, criteria, projection = {}) => {
    projection.projection = {...projection.projection, ...NORMAL_PROJECTION};
    return await model.findOneAndDelete(criteria, projection).lean();
};

/**
* function to update one.
*/
dbService.updateOne = async (model, criteria, dataToUpdate, options = {}) => {
    return await model.updateOne(criteria, dataToUpdate, options).lean();
};

/**
* function to update Many.
*/
dbService.updateMany = async (model, criteria, dataToUpdate, options = {}) => {
    return await model.updateMany(criteria, dataToUpdate, options).lean();
};

/**
* function to delete one.
*/
dbService.deleteOne = async (model, criteria) => {
    return await model.deleteOne(criteria);
};

/**
* function to delete Many.
*/
dbService.deleteMany = async (model, criteria) => {
    return await model.deleteMany(criteria);
};

/**
* function to apply aggregate on model.
*/
dbService.aggregate = async (model, query) => {
    return await model.aggregate(query);
};
dbService.countDocuments = async (model, query) => {
    return await model.countDocuments(query);
};
// dbService.findByID = async (model, query) => {
//     return await model.fi(query);
// };
module.exports = dbService;
