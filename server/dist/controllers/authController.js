"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.signUp = exports.signRefreshToken = exports.signAccessToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = require("bcryptjs");
const validation_1 = require("@form-builder/validation");
const jsonwebtoken_1 = require("jsonwebtoken");
const google_auth_library_1 = require("google-auth-library");
const userModel_1 = __importDefault(require("../models/userModel"));
const catchAsyncError_1 = __importDefault(require("../utils/catchAsyncError"));
const appError_1 = __importDefault(require("../utils/appError"));
const constants_1 = require("../utils/constants");
const sendEmail_1 = __importDefault(require("../utils/sendEmail"));
const signAccessToken = (id) => (0, jsonwebtoken_1.sign)({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: constants_1.accessTokenExpiresIn,
});
exports.signAccessToken = signAccessToken;
const signRefreshToken = (id) => (0, jsonwebtoken_1.sign)({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: constants_1.refreshTokenExpiresIn,
});
exports.signRefreshToken = signRefreshToken;
exports.signUp = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const result = await validation_1.registerSchema.safeParseAsync(req.body);
    if (!result.success)
        return next(new appError_1.default('Validation failed!', 400, result.error.flatten().fieldErrors));
    const foundUser = await userModel_1.default.findOne({ email: result.data.email }).exec();
    if (foundUser)
        return next(new appError_1.default('User already exists!', 409, {
            email: ['Email already exists'],
        }));
    const { name, email } = result.data;
    const password = await (0, bcryptjs_1.hash)(result.data.password, 12);
    const newUser = await userModel_1.default.create({ name, email, password });
    (0, sendEmail_1.default)({
        email: newUser.email,
        subject: 'Welcome to Form Builder',
        message: 'Thank you for signing up with Form Builder!',
    });
    const newRefreshToken = (0, exports.signRefreshToken)(newUser._id.toString());
    newUser.refreshToken = [newRefreshToken];
    await newUser.save();
    res.cookie('refreshToken', newRefreshToken, constants_1.cookieOptions);
    res.status(201).json({
        status: 'success',
        accessToken: (0, exports.signAccessToken)(newUser._id.toString()),
        data: {
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                avatar: newUser.avatar,
            },
        },
    });
});
exports.login = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const { cookies } = req;
    const { email, password } = req.body;
    if (!email || !password)
        return next(new appError_1.default('Please provide email and password!', 400));
    const foundUser = await userModel_1.default.findOne({ email }).select('+password').exec();
    if (!foundUser || !(await (0, bcryptjs_1.compare)(password, foundUser.password)))
        return next(new appError_1.default('Incorrect email or password!', 401));
    const newRefreshToken = (0, exports.signRefreshToken)(foundUser._id.toString());
    let newRefreshTokenArray = !cookies?.refreshToken
        ? foundUser.refreshToken
        : foundUser.refreshToken.filter(r => r !== cookies.refreshToken);
    if (cookies?.refreshToken) {
        /* For this scenario:
          1) User logs in but never uses refresh token and does not log out
          2) Refresh token is stolen
          3) If 1 and 2 happen, reuse detection is needed to clear all refresh tokens when user logs in
        */
        const foundToken = await userModel_1.default.findOne({
            refreshToken: cookies.refreshToken,
        }).exec();
        // Detected refresh token reuse
        if (!foundToken)
            newRefreshTokenArray = [];
        res.clearCookie('refreshToken', constants_1.cookieOptions);
    }
    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    await foundUser.save();
    res.cookie('refreshToken', newRefreshToken, constants_1.cookieOptions);
    res.status(200).json({
        status: 'success',
        accessToken: (0, exports.signAccessToken)(foundUser._id.toString()),
        data: {
            user: {
                id: foundUser._id,
                name: foundUser.name,
                email: foundUser.email,
                avatar: foundUser.avatar,
            },
        },
    });
});
exports.logout = (0, catchAsyncError_1.default)(async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        res.sendStatus(204);
        return;
    }
    const foundUser = await userModel_1.default.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('refreshToken', constants_1.cookieOptions);
        res.sendStatus(204);
        return;
    }
    foundUser.refreshToken = foundUser.refreshToken.filter(r => r !== refreshToken);
    await foundUser.save();
    res.clearCookie('refreshToken', constants_1.cookieOptions);
    res.sendStatus(204);
});
exports.forgotPassword = (0, catchAsyncError_1.default)(async (req, res, next) => {
    // Validate email
    const result = await validation_1.forgotPasswordSchema.safeParseAsync(req.body);
    if (!result.success)
        return next(new appError_1.default('Validation failed!', 400, result.error.flatten().fieldErrors));
    // Get user based on email
    const foundUser = await userModel_1.default.findOne({ email: result.data.email }).exec();
    if (!foundUser)
        return next(new appError_1.default('There is no user with that email address!', 404));
    // Generate random reset token
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    foundUser.passwordResetToken = crypto_1.default
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    foundUser.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await foundUser.save();
    // Send it to user's email
    const resetUrl = `${req.header('Referer')}reset-password/${resetToken}`;
    const message = 'You are receiving this email because you have just requested to reset your Form Builder password. Please click on the link below or copy and paste the URL in a new browser window to reset your password:\n\n' +
        `${resetUrl}\n\n` +
        'If you did not request this, please ignore this email and your password will remain unchanged.';
    try {
        await (0, sendEmail_1.default)({
            email: foundUser.email,
            subject: 'Password reset token for Form Builder account (valid for 10 minutes)',
            message,
        });
        res.status(200).json({
            status: 'success',
            message: 'Email sent successfully',
        });
    }
    catch (err) {
        foundUser.passwordResetToken = undefined;
        foundUser.passwordResetExpires = undefined;
        await foundUser.save();
        return next(new appError_1.default('There was an error sending the email. Try again later!', 500));
    }
});
exports.resetPassword = (0, catchAsyncError_1.default)(async (req, res, next) => {
    // Get user based on the token
    const hashedToken = crypto_1.default
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const foundUser = await userModel_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    }).exec();
    // If token has not expired, and there is user, and success in validation, set the new password
    if (!foundUser)
        return next(new appError_1.default('Token is invalid or has expired!', 400));
    // Validate password and confirm password
    const result = await validation_1.resetPasswordSchema.safeParseAsync(req.body);
    if (!result.success)
        return next(new appError_1.default('Validation failed!', 400, result.error.flatten().fieldErrors));
    foundUser.password = await (0, bcryptjs_1.hash)(result.data.newPassword, 12);
    foundUser.passwordResetToken = undefined;
    foundUser.passwordResetExpires = undefined;
    foundUser.passwordChangedAt = new Date();
    await foundUser.save();
    res.status(200).json({
        status: 'success',
        message: 'Password reset successfully',
    });
});
exports.googleLogin = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const oAuth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'postmessage');
    const { tokens } = await oAuth2Client.getToken(req.body.code);
    if (!tokens.id_token)
        return next(new appError_1.default('Failed to retrieve user data from google!', 500));
    const decoded = (0, jsonwebtoken_1.decode)(tokens.id_token);
    console.log(decoded);
    res.status(200).json({
        status: 'success',
        data: tokens,
    });
});
