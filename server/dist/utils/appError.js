"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    constructor(message, statusCode, errors) {
        super(message);
        this.isOperational = true;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = AppError;
