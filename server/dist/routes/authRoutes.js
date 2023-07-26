"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const refreshTokenController_1 = __importDefault(require("../controllers/refreshTokenController"));
const loginLimiter_1 = __importDefault(require("../middleware/loginLimiter"));
const router = (0, express_1.Router)();
router.post('/signup', authController_1.signUp);
router.post('/login', loginLimiter_1.default, authController_1.login);
router.get('/logout', authController_1.logout);
router.post('/google', authController_1.googleLogin);
router.post('/forgot-password', authController_1.forgotPassword);
router.patch('/reset-password/:token', authController_1.resetPassword);
router.get('/refresh', refreshTokenController_1.default);
exports.default = router;
