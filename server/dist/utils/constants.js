"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cookieOptions = exports.refreshTokenExpiresIn = exports.accessTokenExpiresIn = exports.allowedOrigins = void 0;
exports.allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://easyformbuilder.netlify.app',
];
exports.accessTokenExpiresIn = '1h';
exports.refreshTokenExpiresIn = '7d';
exports.cookieOptions = {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};
