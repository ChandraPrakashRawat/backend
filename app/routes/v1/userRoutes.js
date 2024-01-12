'use strict';

const { Joi } = require('../../utils/joiUtils');
const { EMAIL_REGEX, PASSWORD_PATTER_REGEX, AVAILABLE_AUTHS, PHONE_REGEX } = require('../../utils/constants');
const { userController } = require('../../controllers');

module.exports = [
	{
		method: 'GET',
		path: '/',
		joiSchemaForSwagger: {
			group: 'TEST',
			description: 'Route to check server is working fine or not?',
			model: 'SERVER'
		},
		handler: userController.getServerResponse
	},
	{
		method: 'GET',
		path: '/v1/dashboard/admin',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("user's token"),
			},
			group: 'TEST',
			description: '',
			model: 'SERVER'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: userController.getDashboardDataAdmin
	},
	{
		method: 'POST',
		path: '/v1/user/signup',
		joiSchemaForSwagger: {
			body: {
				userName: Joi.string().case("lower").required(),
				name: Joi.string().required(),
				email: Joi.string().case('lower').regex(EMAIL_REGEX).optional(),
				phone: Joi.string().regex(PHONE_REGEX).message('Please enter valid phone number').optional(),
				referral_code: Joi.string().optional().allow(""),
				password: Joi.string().required(),
			},
			group: 'USER',
			description: 'Route to user singup',
			model: 'UserSignup'
		},
		handler: userController.userSignup
	},
	{
		method: 'POST',
		path: '/v1/user/login',
		joiSchemaForSwagger: {
			body: {
				id: Joi.string().required(),
				password: Joi.string().required()
			},
			group: 'USER',
			description: 'Route to login a user',
			model: 'LoginUser'
		},
		handler: userController.loginUser
	},
	{
		method: 'GET',
		path: '/v1/users',
		joiSchemaForSwagger: {
			query: {
				search: Joi.string().allow(""),
				sortDirection: Joi.number(),
				page: Joi.number(),
				limit: Joi.number(),
			},
			group: 'USER',
			description: '',
			model: ''
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: userController.getUsers
	},
	{
		method: 'POST',
		path: '/v1/user/login/admin',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().required(),
				google: Joi.boolean(),
				password: Joi.string().description("user's password")
			},
			group: 'USER',
			description: 'Route to login admin',
			model: 'LoginUser'
		},
		handler: userController.loginUserAdmin
	},
	{
		method: 'POST',
		path: '/v1/user/resetPass',
		joiSchemaForSwagger: {
			body: {
				email: Joi.string().case("lower").required(),
				oldPassword: Joi.string().required(),
				newPassword: Joi.string().required()
			},
			group: 'USER',
			description: 'Route to reset password of a user using old password',
			model: 'ResetPass'
		},
		handler: userController.resetPass
	},
	{
		method: 'POST',
		path: '/v1/user/resetPass/sendOTP',
		joiSchemaForSwagger: {
			body: {
				id: Joi.string().required().description("user's email or phone"),
			},
			group: 'USER',
			description: 'Route to send otp for reseting password of a user',
			model: 'SendOTP'
		},
		handler: userController.sendOTP
	},
	{
		method: 'POST',
		path: '/v1/user/resetPass/verifyOTP',
		joiSchemaForSwagger: {
			body: {
				id: Joi.string().required().description("user's email or phone"),
				otp: Joi.string().required().description("OTP"),
				newPassword: Joi.string().regex(PASSWORD_PATTER_REGEX).required().description("user's new password")
			},
			group: 'USER',
			description: 'Route to verify OTP for reseting password of a user',
			model: 'VerifyOTP'
		},
		handler: userController.verifyOTP
	},
	{
		method: 'POST',
		path: '/v1/user/updateProfile',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("user's token"),
			},
			body: {
				name: Joi.string().required(),
				userName: Joi.string().case("lower").required(),
				email: Joi.string().required(),
				phone: Joi.string().allow(""),
				old_pass: Joi.string().allow(""),
				new_pass: Joi.string().allow(""),
			},
			group: 'USER',
			description: 'Route to update profile of a user',
			model: 'UpdateProfile'
		},
		auth: AVAILABLE_AUTHS.ADMIN_USER,
		handler: userController.updateProfile
	},
	{
		method: 'POST',
		path: '/v1/user/collectCoins',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("user's token"),
			},
			group: 'USER',
			description: 'Route to update profile of a user',
			model: 'UpdateProfile'
		},
		auth: AVAILABLE_AUTHS.USER,
		handler: userController.collectDailyCoins
	},
	{
		method: 'GET',
		path: '/v1/user/teamList',
		joiSchemaForSwagger: {
			query: {
				referral_code: Joi.string().allow(""),
				page: Joi.number(),
				limit: Joi.number(),
				search: Joi.string().allow(""),
				sortDirection: Joi.number(),
			},
			headers: {
				authorization: Joi.string().required().description("user's token"),
			},
			group: 'USER',
			description: 'Route to update profile of a user',
			model: 'UpdateProfile'
		},
		auth: AVAILABLE_AUTHS.ADMIN_USER,
		handler: userController.getTeamList
	},
	{
		method: 'GET',
		path: '/v1/user/coinsHistory',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("user's token"),
			},
			group: 'USER',
			description: 'Route to update profile of a user',
			model: 'UpdateProfile'
		},
		auth: AVAILABLE_AUTHS.ADMIN_USER,
		handler: userController.getCoinsHistory
	},
	{
		method: 'GET',
		path: '/v1/user/referPoints',
		joiSchemaForSwagger: {
			query: {
				type: Joi.number(),
				page: Joi.number(),
				limit: Joi.number(),
				search: Joi.string().allow(""),
				sortDirection: Joi.number(),
			},
			headers: {
				authorization: Joi.string().required().description("user's token"),
			},
			group: 'USER',
			description: 'Route to update profile of a user',
			model: 'UpdateProfile'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: userController.getReferPoints
	},
	{
		method: 'POST',
		path: '/v1/user/admin/options',
		joiSchemaForSwagger: {
			body: {
				dailyPoints: Joi.number().min(0),
				referPoints: Joi.number().min(0),
				footer: Joi.string(),
				about: Joi.string(),
				address: Joi.string(),
				appName: Joi.string(),
				termsAndConditions: Joi.string(),
				privacyAndPolicy: Joi.string()
			},
			headers: {
				authorization: Joi.string().required().description("user's token"),
			},
			group: 'USER',
			description: 'Route to update profile of a user',
			model: 'UpdateProfile'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: userController.changeAdminOptions
	},
	{
		method: 'GET',
		path: '/v1/user/admin/options',
		joiSchemaForSwagger: {
			// headers: {
			// 	authorization: Joi.string().required().description("user's token"),
			// },
			group: 'USER',
			description: 'Route to update profile of a user',
			model: 'UpdateProfile'
		},
		// auth: AVAILABLE_AUTHS.ADMIN,
		handler: userController.getAdminOptions
	},
	{
		method: 'POST',
		path: '/v1/user/admin/admins_coins',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("user's token"),
			},
			body: {
				id: Joi.string().required(),
				adminCoins: Joi.number().required()
			},
			group: 'USER',
			description: 'Route to update profile of a user',
			model: 'UpdateProfile'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: userController.addAdminsCoins
	},
	{
		method: 'POST',
		path: '/v1/user/admin/feedback',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("user's token"),
			},
			body: {
				comment: Joi.string().optional(),
				interested: Joi.string().required(),
				ratting: Joi.number().required()
			},
			group: 'USER',
			description: 'Add feedback',
			model: 'feedbacks'
		},
		auth: AVAILABLE_AUTHS.USER,
		handler: userController.addFeedback
	},
	{
		method: 'GET',
		path: '/v1/user/admin/get_all_feedbacks',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("user's token"),
			},
			query: {
				page: Joi.number(),
				limit: Joi.number(),
			},
			group: 'USER',
			description: 'Get All Feedbacks',
			model: 'feedbacks'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: userController.getAllFeedbacks
	},
	{
		method: 'POST',
		path: '/v1/user/admin/upload_image',
		joiSchemaForSwagger: {
			headers: {
				authorization: Joi.string().required().description("user's token"),
			},
			file: Joi.any().meta({ swaggerType: 'file' }).optional(),
			group: 'USER',
			description: 'Upload Image'
		},
		auth: AVAILABLE_AUTHS.ADMIN,
		handler: userController.uploadFile
	},
	{
		method: 'POST',
		path: '/v1/user/send_otp',
		joiSchemaForSwagger: {
			body: {
				id: Joi.string().required().description("Email or Phone number")
			},
			group: 'USER',
			description: 'forgot Password',
			model: 'users'
		},
		handler: userController.forgotPassword
	},
	{
		method: 'PUT',
		path: '/v1/user/change_password',
		joiSchemaForSwagger: {
			body: {
				id: Joi.string().required().description("Email or Phone number"),
				password: Joi.string().required().description("Password")
			},
			group: 'USER',
			description: 'Change Password',
			model: 'users'
		},
		handler: userController.changePassword
	}
];