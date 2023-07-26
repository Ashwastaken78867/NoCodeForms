"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const userModel_1 = __importDefault(require("../models/userModel"));
const catchAsyncError_1 = __importDefault(require("../utils/catchAsyncError"));
const appError_1 = __importDefault(require("../utils/appError"));
const verifyJWT = (0, catchAsyncError_1.default)(async (req, _, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return next(new appError_1.default('You are not logged in! Please log in to get access.', 401));
    (0, jsonwebtoken_1.verify)(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err)
            return next(new appError_1.default('Invalid token!', 403));
        const { id, iat } = decoded;
        userModel_1.default.findById(id).then(user => {
            // Check if user still exists
            if (!user)
                return next(new appError_1.default('The user belonging to this token no longer exist.', 401));
            // Check if user changed password after the token was issued
            if (user.passwordChangedAt &&
                user.passwordChangedAt.getTime() > iat * 1000)
                return next(new appError_1.default('User recently changed password! Please log in again', 401));
        });
        req.userId = id;
        next();
    });
});
exports.default = verifyJWT;
