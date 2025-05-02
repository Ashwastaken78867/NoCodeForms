"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = catchAsyncError;
function catchAsyncError(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
