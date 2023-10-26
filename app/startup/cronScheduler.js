'use strict';

const cron = require('node-cron');

const cronTasks = {};

module.exports = async () => {

    /** schedules for every 10 minutes  */
    cron.schedule("*/10 * * * *", async () => {
        console.log("Cron job at", new Date());
    });

};