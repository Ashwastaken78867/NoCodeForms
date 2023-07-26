"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteForm = exports.updateForm = exports.createForm = exports.getForm = exports.deleteForms = exports.getAllForms = void 0;
const catchAsyncError_1 = __importDefault(require("../utils/catchAsyncError"));
const formModel_1 = __importDefault(require("../models/formModel"));
const appError_1 = __importDefault(require("../utils/appError"));
exports.getAllForms = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;
    const skip = page * pageSize;
    const searchQuery = req.query.search;
    const query = searchQuery
        ? { user: req.userId, name: { $regex: searchQuery, $options: 'i' } }
        : { user: req.userId };
    const total = await formModel_1.default.countDocuments(query);
    if (req.query.page && req.query.page !== '0' && skip >= total)
        return next(new appError_1.default('This page does not exist', 404));
    const forms = await formModel_1.default.find(query)
        .sort(req.query.sort?.toString())
        .skip(skip)
        .limit(pageSize)
        .exec();
    res.status(200).json({
        status: 'success',
        data: {
            forms,
            total,
        },
    });
});
exports.deleteForms = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const { forms } = req.body;
    if (!forms)
        return next(new appError_1.default('Please provide list of form id!', 400));
    await formModel_1.default.deleteMany({ _id: { $in: forms } });
    res.sendStatus(204);
});
exports.getForm = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const form = await formModel_1.default.findById(req.params.id);
    if (!form)
        return next(new appError_1.default('No form found with that ID', 404));
    res.status(200).json({
        status: 'success',
        data: {
            form,
        },
    });
});
exports.createForm = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const { name, elements } = req.body;
    if (!name)
        return next(new appError_1.default('Please provide the name of the form!', 400));
    if (elements.length === 0)
        return next(new appError_1.default('Please add some elements to the form!', 400));
    const newForm = await formModel_1.default.create({
        name,
        elements: elements ?? [],
        user: req.userId,
    });
    res.status(201).json({
        status: 'success',
        data: {
            form: newForm,
        },
    });
});
exports.updateForm = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const form = await formModel_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    if (!form)
        return next(new appError_1.default('No form found with that ID', 404));
    res.status(200).json({
        status: 'success',
        data: {
            form,
        },
    });
});
exports.deleteForm = (0, catchAsyncError_1.default)(async (req, res, next) => {
    const form = await formModel_1.default.findByIdAndDelete(req.params.id);
    if (!form)
        return next(new appError_1.default('No form found with that ID', 404));
    res.sendStatus(204);
});
