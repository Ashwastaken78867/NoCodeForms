"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponse = exports.getAllResponses = void 0;
const catchAsyncError_1 = __importDefault(require("../utils/catchAsyncError"));
const formResponseModel_1 = __importDefault(require("../models/formResponseModel"));
const formModel_1 = __importDefault(require("../models/formModel"));
const appError_1 = __importDefault(require("../utils/appError"));
exports.getAllResponses = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const form = await formModel_1.default.findById(req.params.id);
    if (!form)
        return next(new appError_1.default('No form found with that ID', 404));
    const responses = await formResponseModel_1.default.find({ form: req.params.id }).exec();
    res.status(200).json({
        status: 'success',
        data: {
            responses,
        },
    });
});
exports.createResponse = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const { response } = req.body;
    if (!response)
        return next(new appError_1.default('Please provide response of the form!', 400));
    const form = await formModel_1.default.findById(req.params.id);
    if (!form)
        return next(new appError_1.default('No form found with that ID', 404));
    if (!form.isActive)
        return next(new appError_1.default('The form is no longer accepting submissions', 400));
    const newResponse = await formResponseModel_1.default.create({
        form: req.params.id,
        response,
    });
    res.status(201).json({
        status: 'success',
        data: {
            response: newResponse,
        },
    });
});
