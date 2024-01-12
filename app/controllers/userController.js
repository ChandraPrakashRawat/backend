"use strict";

const { createErrorResponse, createSuccessResponse } = require("../helpers");
const { MESSAGES, ERROR_TYPES, EMAIL_TYPES, TOKEN_TYPES, USER_TYPE, bccEmail, ccEmail } = require('../utils/constants');
const { dbService } = require('../services');
const { sendOTP } = require('../services')
const { compareHash, encryptJwt, sendEmail, generateOTP, hashPassword, generateExpiryTime } = require('../utils/utils');
const { UserModel, SessionModel, FixedCoinsModel, CoinsHistoryModel, Feedbacks } = require("../models");
const { Mongoose } = require("mongoose");
const mongoose = require("mongoose");
const fs = require('fs')
const { db } = require("../models/sessionModel");
const feedbackModel = require("../models/feedbackModel");
/**************************************************
 ***************** user controller ***************
 **************************************************/
let userController = {};

/**
 * function to get server response.
 * @param {*} payload
 * @returns
 */
userController.getServerResponse = async (payload) => {
    return createSuccessResponse(MESSAGES.SERVER_IS_WORKING_FINE);
};

userController.getDashboardDataAdmin = async (payload) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let usersCount = await dbService.countDocuments(UserModel, { userType: USER_TYPE.USER });
    let feedbackCount = await dbService.countDocuments(Feedbacks);
    let pending_User = await dbService.countDocuments(CoinsHistoryModel, { coins: { $in: [0, 15] } })

    let matchCriteria = { createdAt: { $gte: today } };
    let data = await dbService.aggregate(CoinsHistoryModel, [
        {
            $facet: {
                refer: [
                    {
                        $match: { type: 1 }
                    },
                    {
                        $group: { _id: "id", sum: { $sum: "$coins" } }
                    }
                ],
                daily: [
                    {
                        $match: matchCriteria
                    },
                    {
                        $match: { type: 2 }
                    },
                    {
                        $group: { _id: "id", sum: { $sum: "$coins" } }
                    }
                ]
            }
        }
    ]);

    return createSuccessResponse(MESSAGES.SERVER_IS_WORKING_FINE, { usersCount, feedbackCount, pending_User, referPoints: (data[0]?.refer[0]?.sum) ? (data[0]?.refer[0]?.sum) : 0, dailyPoints: (data[0]?.daily[0]?.sum) ? (data[0]?.daily[0]?.sum) : 0 });
};

/**
 * function to signup a user.
 * @param {*} payload
 * @returns
 */
userController.userSignup = async (payload) => {
    let user = await dbService.findOne(UserModel, { $or: [{ email: payload.email }, { userName: payload.userName, phone: payload.phone }] });
    if (user) {
        if (user.userName && user.userName == payload.userName) return createErrorResponse(MESSAGES.USERNAME_ALREADY_TAKEN, ERROR_TYPES.ALREADY_EXISTS);
        if (user.phone && user.phone == payload.phone) return createErrorResponse(MESSAGES.PHONE_ALREADY_TAKEN, ERROR_TYPES.ALREADY_EXISTS);
        if (user.email && user.email == payload.email) return createErrorResponse(MESSAGES.EMAIL_ALREADY_TAKEN, ERROR_TYPES.ALREADY_EXISTS);
    }

    let referredBy;
    if (payload.referral_code) {
        let user = await dbService.findOne(UserModel, { referral_code: payload.referral_code });

        if (!user) return createErrorResponse(MESSAGES.INVALID_REFERRAL_CODE, ERROR_TYPES.ALREADY_EXISTS);

        let coins = (await dbService.findOne(FixedCoinsModel, {}))?.referPoints || 0;
        payload.coins = coins;
        payload.lastCollectedDate = generateExpiryTime(60 * 60 * 24);
        referredBy = user;
    }

    payload.referral_code = parseInt(Math.random() * 10000000).toString();

    payload.password = hashPassword(payload.password);
    user = (await dbService.create(UserModel, payload)).toObject();
    if (referredBy) await dbService.create(CoinsHistoryModel, { usedBy: user._id, type: 1, coins: payload.coins, referredBy: referredBy._id });

    delete user.password;
    delete user.createdAt;
    delete user.updatedAt;

    let token = encryptJwt({ userId: user._id, date: Date.now() });
    await dbService.updateOne(SessionModel, { userId: user._id, tokenType: TOKEN_TYPES.LOGIN }, { userId: user._id, userType: user.userType, tokenType: TOKEN_TYPES.LOGIN, token }, { upsert: true });
    user.token = token;
    let userType = USER_TYPE.USER

    return createSuccessResponse(MESSAGES.USER_REGISTERED_SUCCESSFULLY, user, userType);
};

/**
 * function to login a user.
 * @param {*} payload
 * @returns
*/
userController.loginUser = async (payload) => {
    let user = await dbService.findOne(UserModel, { $or: [{ email: payload.id }, { phone: { $regex: payload.id, $options: "i" } }, { userName: payload.id }] });
    if (!user || !compareHash(payload.password, user.password)) return createErrorResponse(MESSAGES.INVALID_CREDENTIALS, ERROR_TYPES.BAD_REQUEST);

    delete user.password;

    let token = encryptJwt({ userId: user._id, date: Date.now() });
    await dbService.updateOne(SessionModel, { userId: user._id, tokenType: TOKEN_TYPES.LOGIN }, { userId: user._id, userType: user.userType, tokenType: TOKEN_TYPES.LOGIN, token }, { upsert: true });
    user.token = token;

    return createSuccessResponse(MESSAGES.USER_LOGGED_IN_SUCCESSFULLY, user);
};

userController.getUsers = async (payload) => {
    let matchQuery = {
        userType: USER_TYPE.USER,
        ...(payload.search ? { name: { $regex: payload.search, $options: "i" } } : {}),
    };
    let query = [
        { $match: matchQuery },
        ...(payload.sortDirection != 0 ? [{ $sort: { name: payload.sortDirection } }] : []),
        { $sort: { createdAt: -1 } },
        { $skip: ((payload.page - 1) * payload.limit) },
        { $limit: payload.limit },
        { $project: { password: 0 } },
        {
            $lookup: {
                from: "coinsHistory",
                let: { id: "$_id" },
                pipeline: [
                    {
                        $match: { $expr: { $eq: ["$usedBy", "$$id"] }, type: 1 }
                    },
                    {
                        $limit: 1
                    }
                ],
                as: "referredBy"
            }
        },
        { $unwind: { path: "$referredBy", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "users",
                localField: "referredBy.referredBy",
                foreignField: "_id",
                as: "referredBy"
            }
        },
        { $unwind: { path: "$referredBy", preserveNullAndEmptyArrays: true } },
        {
            $project: { "referredBy.password": 0 }
        },
        {
            $lookup: {
                from: "coinsHistory",
                let: { id: "$_id" },
                pipeline: [
                    {
                        $match: { $expr: { $eq: ["$usedBy", "$$id"] } }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $project: {
                            type: 1,
                            coins: 1,
                            createdAt: 1,
                        }
                    }
                ],
                as: "coinsHistoryData"
            }
        },
        {
            $lookup: {
                from: "coinsHistory",
                let: { id: "$_id" },
                pipeline: [
                    {
                        $match: { $expr: { $eq: ["$referredBy", "$$id"] } }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "usedBy",
                            foreignField: "_id",
                            as: "usedBy"
                        }
                    },
                    {
                        $unwind: { path: "$usedBy", preserveNullAndEmptyArrays: true }
                    },
                    {
                        $project: {
                            "usedBy.name": 1,
                            "usedBy.userName": 1,
                            type: 1,
                            coins: 1,
                            createdAt: 1,
                        }
                    }
                ],
                as: "teamListData"
            }
        },
    ];

    let users = await dbService.aggregate(UserModel, query);
    let count = await dbService.countDocuments(UserModel, matchQuery);

    return createSuccessResponse(MESSAGES.USER_LOGGED_IN_SUCCESSFULLY, { data: users, count });
};

userController.loginUserAdmin = async (payload) => {
    let user = await dbService.findOne(UserModel, { $or: [{ email: payload.email, userType: USER_TYPE.ADMIN }] });
    if (!user || !compareHash(payload.password, user.password)) return createErrorResponse(MESSAGES.INVALID_CREDENTIALS, ERROR_TYPES.BAD_REQUEST);

    delete user.password;

    let token = encryptJwt({ userId: user._id, date: Date.now() });
    await dbService.updateOne(SessionModel, { userId: user._id, tokenType: TOKEN_TYPES.LOGIN }, { userId: user._id, userType: USER_TYPE.ADMIN, tokenType: TOKEN_TYPES.LOGIN, token }, { upsert: true, new: true });
    user.token = token;

    return createSuccessResponse(MESSAGES.USER_LOGGED_IN_SUCCESSFULLY, user);
};

/**
 * function to reset password of a user using old password.
 * @param {*} payload
 * @returns
*/
userController.resetPass = async (payload) => {
    let user = await dbService.findOne(UserModel, { email: payload.email });
    if (!user || !compareHash(payload.oldPassword, user.password)) return createErrorResponse(MESSAGES.INVALID_CREDENTIALS, ERROR_TYPES.BAD_REQUEST);

    let newPassword = hashPassword(payload.newPassword);
    await dbService.findOneAndUpdate(UserModel, { _id: user._id }, { password: newPassword }, { new: true });

    return createSuccessResponse("Password changed successfully");
};

/**
 * function to send otp for reseting password of a user.
 * @param {*} payload
 * @returns
*/
userController.sendOTP = async (payload) => {
    let user = await dbService.findOne(UserModel, { $or: [{ email: payload.id }, { phone: payload.id }] });
    if (!user) return createErrorResponse(MESSAGES.ACCOUNT_DOES_NOT_EXIST, ERROR_TYPES.BAD_REQUEST);

    let session = await dbService.findOne(SessionModel, { userId: user._id, tokenType: TOKEN_TYPES.RESET_PASSWORD_OTP });
    if (session) {
        let diff = (new Date() - session.updatedAt) - 60000;
        if (diff < 0) {
            diff += 60000;
            let errorString = MESSAGES.CAN_SEND_OTP_AFTER(60 - parseInt(diff / 1000));
            return createErrorResponse(errorString, ERROR_TYPES.BAD_REQUEST, { seconds: 60 - parseInt(diff / 1000) });
        }
    }

    let token = generateOTP(6);
    await dbService.updateOne(SessionModel, { userId: user._id, tokenType: TOKEN_TYPES.RESET_PASSWORD_OTP }, { userId: user._id, userType: user.userType, tokenType: TOKEN_TYPES.RESET_PASSWORD_OTP, token, tokenExpDate: generateExpiryTime(300) }, { upsert: true });

    if (user.email) await sendEmail({ bccEmail: bccEmail, ccEmail: ccEmail, email: user.email, userName: user.name || "user", otp: token }, EMAIL_TYPES.RESET_PASS_EMAIL);

    return createSuccessResponse(MESSAGES.OTP_SENT);
};

/**
 * function to verify otp for reseting password of a user.
 * @param {*} payload
 * @returns
*/
userController.verifyOTP = async (payload) => {
    let user = await dbService.findOne(UserModel, { $or: [{ email: payload.id }, { phone: payload.id }] });
    if (!user) return createErrorResponse(MESSAGES.ACCOUNT_DOES_NOT_EXIST, ERROR_TYPES.BAD_REQUEST);

    let session = await dbService.findOneAndDelete(SessionModel, { userId: user._id, tokenType: TOKEN_TYPES.RESET_PASSWORD_OTP, token: payload.otp });
    if (session) {
        if (session.tokenExpDate < new Date()) return createErrorResponse(MESSAGES.OTP_EXPIRED, ERROR_TYPES.BAD_REQUEST);

        let newPassword = hashPassword(payload.newPassword);
        user = await dbService.findOneAndUpdate(UserModel, { _id: user._id }, { password: newPassword }, { upsert: true, new: true });

        let token = encryptJwt({ userId: user._id, date: Date.now() });
        await dbService.updateOne(SessionModel, { userId: user._id, tokenType: TOKEN_TYPES.LOGIN }, { userId: user._id, userType: user.userType, tokenType: TOKEN_TYPES.LOGIN, token }, { upsert: true });
        user.token = token;
        delete user.password;

        return createSuccessResponse(MESSAGES.PASSWORD_RESETED_SUCCESSFULLY, user);
    }

    return createErrorResponse(MESSAGES.INVALID_OTP, ERROR_TYPES.BAD_REQUEST);
};

/**
 * function to update profile of a user.
 * @param {*} payload
 * @returns
*/
userController.updateProfile = async (payload) => {

    if (payload.old_pass) {
        if (!payload.new_pass) return createErrorResponse(MESSAGES.NEW_PASS_IS_REQ, ERROR_TYPES.BAD_REQUEST);
        if (!compareHash(payload.old_pass, payload.user.password)) return createErrorResponse(MESSAGES.WRONG_PASS, ERROR_TYPES.BAD_REQUEST);
    }

    if (payload.email || payload.phone || payload.userName) {
        let searchCriteria = [{ email: payload.email }, { userName: payload.userName }];
        if (payload.phone) searchCriteria = [...searchCriteria, { phone: payload.phone }];
        let user = await dbService.findOne(UserModel, { $or: searchCriteria, _id: { $ne: payload.user._id } });
        if (user) {
            if (payload.userName && user.userName == payload.userName) return createErrorResponse(MESSAGES.USERNAME_ALREADY_TAKEN, ERROR_TYPES.ALREADY_EXISTS);
            if (payload.phone && user.phone == payload.phone) return createErrorResponse(MESSAGES.PHONE_ALREADY_TAKEN, ERROR_TYPES.ALREADY_EXISTS);
            return createErrorResponse(MESSAGES.EMAIL_ALREADY_TAKEN, ERROR_TYPES.ALREADY_EXISTS);
        }
    }
    if (payload.new_pass) payload.password = hashPassword(payload.new_pass);

    let user = await dbService.findOneAndUpdate(UserModel, { _id: payload.user._id }, { $set: payload }, { new: true, projection: { password: 0 } });

    return createSuccessResponse(MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, user);
};

userController.collectDailyCoins = async (payload) => {

    let user = payload.user;

    if (user.lastCollectedDate && user.lastCollectedDate > new Date()) return createErrorResponse(MESSAGES.CANNOT_COLLECT_COINS, ERROR_TYPES.BAD_REQUEST);

    let coins = (await dbService.findOne(FixedCoinsModel, {}))?.dailyPoints || 0;

    user = await dbService.findOneAndUpdate(UserModel, { _id: user._id }, { $inc: { coins }, $set: { lastCollectedDate: generateExpiryTime(60 * 60 * 24) } }, { projection: { password: 0 }, new: true });

    await dbService.create(CoinsHistoryModel, { usedBy: payload.user._id, type: 2, coins });

    return createSuccessResponse(MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, user);
};

userController.getTeamList = async (payload) => {

    let user = payload.user;

    if (payload.user.userType == USER_TYPE.ADMIN) {
        let findUser = await dbService.findOne(UserModel, { referral_code: payload.referral_code });

        if (!findUser) return createSuccessResponse(MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, { data: [], count: 0 });

        user = findUser;
    }

    let coinsHistory = await dbService.aggregate(CoinsHistoryModel, [
        {
            $match: { referredBy: user._id }
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "usedBy",
                foreignField: "_id",
                as: "usedBy"
            }
        },
        {
            $unwind: { path: "$usedBy", preserveNullAndEmptyArrays: true }
        },
        ...(payload.search ? [{ $match: { "usedBy.name": { $regex: payload.search, $options: "i" } } }] : []),
        ...((payload.skip && payload.limit) ? [
            { $skip: ((payload.page - 1) * payload.limit) },
            { $limit: payload.limit },
        ] : []),
        {
            $project: {
                "usedBy.password": 0,
            }
        }
    ]);
    let count = await dbService.countDocuments(CoinsHistoryModel, { referredBy: user._id });

    if (payload.user.userType == USER_TYPE.ADMIN) return createSuccessResponse(MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, { data: coinsHistory, count });

    return createSuccessResponse(MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, coinsHistory);
};

userController.getCoinsHistory = async (payload) => {

    let user = payload.user;

    if (payload.user.userType == USER_TYPE.ADMIN) {
    }

    let coinsHistory = await dbService.aggregate(CoinsHistoryModel, [
        {
            $facet: {
                adminCoins: [
                    {
                        $match: { usedBy: user._id, type: 3 }
                    },
                    {
                        $group: {
                            _id: null,
                            sum: { $sum: "$coins" }
                        }
                    }
                ],
                otherCoins: [
                    {
                        $match: { usedBy: user._id }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $project: {
                            // "referredBy.name": 1,
                            // "referredBy.userName": 1,
                            type: 1,
                            coins: 1,
                            createdAt: 1,
                            adminCoins: 1
                        }
                    }
                ],
                totalCoins: [
                    {
                        $match: { usedBy: user._id }
                    },
                    {
                        $group: {
                            _id: null,
                            sum: { $sum: "$coins" }
                        }
                    }
                ]
            }
        }
    ]);
    let type = coinsHistory.type

    return createSuccessResponse(MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, coinsHistory,);
};

userController.getReferPoints = async (payload) => {

    let searchCriteria = { type: payload.type };

    let data = await dbService.aggregate(CoinsHistoryModel, [
        {
            $match: searchCriteria
        },
        {
            $lookup: {
                from: "users",
                localField: "referredBy",
                foreignField: "_id",
                as: "referredBy"
            }
        },
        {
            $unwind: { path: "$referredBy", preserveNullAndEmptyArrays: true }
        },
        {
            $lookup: {
                from: "users",
                localField: "usedBy",
                foreignField: "_id",
                as: "usedBy"
            }
        },
        {
            $unwind: { path: "$usedBy", preserveNullAndEmptyArrays: true }
        },
        ...(payload.search ? [{ $match: { "usedBy.name": { $regex: payload.search, $options: "i" } } }] : []),
        {
            $facet: {
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: ((payload.page - 1) * payload.limit) },
                    { $limit: payload.limit },
                    {
                        $project: {
                            "referredBy.password": 0,
                            "usedBy.password": 0,
                        }
                    }
                ],
                count: [
                    {
                        $group: { _id: "id", count: { $sum: 1 } }
                    }
                ]
            }
        }
    ]);

    return createSuccessResponse(MESSAGES.PROFILE_UPDATED_SUCCESSFULLY, { data: (data[0]?.data) ? (data[0]?.data) : [], count: (data[0]?.count[0]?.count) ? (data[0]?.count[0]?.count) : 0 });
};

userController.changeAdminOptions = async (payload) => {

    await dbService.findOneAndUpdate(FixedCoinsModel, {}, payload);

    return createSuccessResponse(MESSAGES.PROFILE_UPDATED_SUCCESSFULLY);
};

userController.getAdminOptions = async () => {

    let data = await dbService.findOne(FixedCoinsModel, {});
    data.file_path = '/uploads/img.jpg'
    return createSuccessResponse("", data);
};

userController.addAdminsCoins = async (payload) => {
    let data = await dbService.findOneAndUpdate(UserModel, { _id: new mongoose.Types.ObjectId(payload.id) },
        {
            $set: {
                adminCoins: payload.adminCoins
            }
        },
        { new: true });
    await dbService.create(CoinsHistoryModel, { usedBy: payload.id, type: 3, coins: payload.adminCoins, referredBy: payload.user._id });
    return createSuccessResponse(MESSAGES.ADMIN_COINS_ADDED, data)
};

userController.addFeedback = async (payload) => {
    let data = await dbService.create(Feedbacks, {
        userID: payload.user._id,
        comment: payload?.comment ?? undefined,
        interested: payload.interested,
        ratting: payload.ratting
    });
    return createSuccessResponse(MESSAGES.SUCCESS, data)
};

userController.getAllFeedbacks = async (payload) => {
    payload.page = payload?.page === undefined || payload?.page === 0 ? 1 : payload.page;
    payload.limit = payload?.limit === undefined || payload?.limit === 0 ? 10 : payload.limit;
    let data = await dbService.aggregate(Feedbacks, [
        {
            $lookup:
            {
                'from': 'users',
                'localField': 'userID',
                'foreignField': '_id',
                'pipeline': [
                    {
                        $project: { _id: 1, name: 1 }
                    }
                ],
                'as': 'userInfo'
            }
        },
        { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
        { $skip: ((payload.page - 1) * payload.limit) },
        { $limit: payload.limit },

    ])
    return createSuccessResponse(MESSAGES.SUCCESS, data)
};

userController.uploadFile = async (payload) => {
    if (payload.file.mimetype == ('image/jpeg' || 'image/jpg')) {
        fs.writeFileSync('uploads/img.jpg', payload.file.buffer)
        return createSuccessResponse(MESSAGES.FILE_UPLOADED_SUCCESSFULLY)
    } else {
        return createErrorResponse("jpeg or jpg file required!!")
    }

}

userController.forgotPassword = async (payload) => {
    const userInfo = await dbService.findOne(UserModel, { $or: [{ phone: payload.id }, { email: payload.id }] })
    const OTP = Math.floor(1000 + Math.random() * 9000);
    const reply = sendOTP({ OTP, email: userInfo.email })
    return createSuccessResponse(MESSAGES.OTP_SENT, { OTP })
}

userController.changePassword = async (payload) => {
    payload.password = hashPassword(payload.password);
    const profile = await dbService.updateOne(UserModel, { $or: [{ phone: payload.id }, { email: payload.id }] }, {
        $set: {
            password: payload.password,
            updatedAt: new Date()
        }
    })

    return createSuccessResponse(MESSAGES.PROFILE_UPDATED_SUCCESSFULLY)
}

module.exports = userController;
