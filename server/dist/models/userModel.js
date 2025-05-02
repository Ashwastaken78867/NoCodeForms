"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    avatar: {
        type: String,
        default: null,
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        select: false,
    },
    passwordChangedAt: Date,
    refreshToken: [String],
    passwordResetToken: String,
    passwordResetExpires: Date,
    isDeleted: {
        type: Boolean,
        default: false,
        select: false,
    },
    deletedAt: {
        type: Date,
        default: null,
        select: false,
    },
}, { timestamps: true });
userSchema.pre(/^find/, function (next) {
    this.where({ isDeleted: false });
    next();
});
exports.default = (0, mongoose_1.model)('User', userSchema);
