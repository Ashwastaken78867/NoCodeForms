"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.deleteAccount = exports.updateProfile = exports.changePassword = exports.resizeUserPhoto = exports.uploadUserPhoto = void 0;
const multer_1 = __importDefault(require("multer"));
const catchAsyncError_1 = __importDefault(require("../utils/catchAsyncError"));
const validation_1 = require("@form-builder/validation");
const appError_1 = __importDefault(require("../utils/appError"));
const userModel_1 = __importDefault(require("../models/userModel"));
const bcryptjs_1 = require("bcryptjs");
const constants_1 = require("../utils/constants");
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/* const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'public', 'img', 'users'));
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.userId}-${Date.now()}.${ext}`);
  },
}); */
const multerStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image'))
            cb(null, true);
        else
            cb(new appError_1.default('Not an image! Please upload only images.', 400));
    },
});
exports.uploadUserPhoto = upload.single('avatar');
const resizeUserPhoto = (req, _res, next) => {
    if (!req.file)
        return next();
    if (!fs_1.default.existsSync(path_1.default.join(__dirname, '..', '..', 'public', 'img', 'users')))
        fs_1.default.mkdirSync(path_1.default.join(__dirname, '..', '..', 'public', 'img', 'users'), {
            recursive: true,
        });
    req.file.filename = `user-${req.userId}-${Date.now()}.jpeg`;
    (0, sharp_1.default)(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(path_1.default.join(__dirname, '..', '..', 'public', 'img', 'users', req.file.filename));
    next();
};
exports.resizeUserPhoto = resizeUserPhoto;
exports.changePassword = (0, catchAsyncError_1.default)(async (req, res, next) => {
    // Validate change password fields
    const result = await validation_1.changePasswordSchema.safeParseAsync(req.body);
    if (!result.success)
        return next(new appError_1.default('Validation failed!', 400, result.error.flatten().fieldErrors));
    const { oldPassword, newPassword } = result.data;
    // Get user from collection
    const foundUser = await userModel_1.default.findById(req.userId)
        .select('+password')
        .exec();
    // Check if posted current password is correct
    if (!foundUser || !(await (0, bcryptjs_1.compare)(oldPassword, foundUser.password)))
        return next(new appError_1.default('Your current password is incorrect', 401));
    // If correct, update password
    foundUser.password = await (0, bcryptjs_1.hash)(newPassword, 12);
    foundUser.passwordChangedAt = new Date();
    foundUser.refreshToken = [];
    await foundUser.save();
    res.clearCookie('refreshToken', constants_1.cookieOptions);
    res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
    });
});
exports.updateProfile = (0, catchAsyncError_1.default)(async (req, res, next) => {
    // Validate user profile fields
    const result = await validation_1.userProfileSchema.safeParseAsync(req.body);
    if (!result.success)
        return next(new appError_1.default('Validation failed!', 400, result.error.flatten().fieldErrors));
    const { name, email } = result.data;
    const updatedUser = await userModel_1.default.findByIdAndUpdate(req.userId, {
        name,
        email,
        avatar: req.file
            ? `${req.protocol}://${req.get('host')}/img/users/${req.file.filename}`
            : req.body.avatar,
    }, { new: true });
    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: updatedUser?._id,
                name: updatedUser?.name,
                email: updatedUser?.email,
                avatar: updatedUser?.avatar,
            },
        },
    });
});
exports.deleteAccount = (0, catchAsyncError_1.default)(async (req, res) => {
    await userModel_1.default.findByIdAndUpdate(req.userId, {
        isDeleted: true,
        deletedAt: new Date(),
    });
    res.sendStatus(204);
});
exports.getProfile = (0, catchAsyncError_1.default)(async (req, res) => {
    const foundUser = await userModel_1.default.findById(req.userId)
        .select('-refreshToken -__v')
        .exec();
    res.status(200).json({
        status: 'success',
        data: {
            user: foundUser,
        },
    });
});
