"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const userModel_1 = __importDefault(require("../models/userModel"));
const catchAsyncError_1 = __importDefault(require("../utils/catchAsyncError"));
const appError_1 = __importDefault(require("../utils/appError"));
const constants_1 = require("../utils/constants");
const authController_1 = require("./authController");
const refreshTokenHandler = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
        return next(new appError_1.default('No refresh token!', 401));
    res.clearCookie('refreshToken', constants_1.cookieOptions);
    const foundUser = await userModel_1.default.findOne({ refreshToken }).exec();
    // Detected refresh token reuse
    if (!foundUser) {
        (0, jsonwebtoken_1.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err)
                return next(new appError_1.default('Invalid refresh token!', 403));
            const hackedUser = await userModel_1.default.findOne({
                _id: decoded.id,
            }).exec();
            if (hackedUser) {
                hackedUser.refreshToken = [];
                await hackedUser.save();
            }
        });
        return next(new appError_1.default('Invalid refresh token!', 403));
    }
    const newRefreshTokenArray = foundUser.refreshToken.filter(r => r !== refreshToken);
    (0, jsonwebtoken_1.verify)(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            foundUser.refreshToken = [...newRefreshTokenArray];
            await foundUser.save();
        }
        if (err || foundUser._id.toString() !== decoded.id)
            return next(new appError_1.default('Invalid refresh token!', 403));
        const accessToken = (0, authController_1.signAccessToken)(foundUser._id.toString());
        const newRefreshToken = (0, authController_1.signRefreshToken)(foundUser._id.toString());
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        await foundUser.save();
        res.cookie('refreshToken', newRefreshToken, constants_1.cookieOptions);
        res.status(200).json({
            status: 'success',
            accessToken,
        });
    });
});
exports.default = refreshTokenHandler;
