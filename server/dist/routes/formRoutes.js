"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const formController_1 = require("../controllers/formController");
const verifyJWT_1 = __importDefault(require("../middleware/verifyJWT"));
const formResponseController_1 = require("../controllers/formResponseController");
const router = (0, express_1.Router)();
router.route('/').get(verifyJWT_1.default, formController_1.getAllForms).post(verifyJWT_1.default, formController_1.createForm);
router.patch('/bulk-delete', verifyJWT_1.default, formController_1.deleteForms);
router
    .route('/:id')
    .get(formController_1.getForm)
    .patch(verifyJWT_1.default, formController_1.updateForm)
    .delete(verifyJWT_1.default, formController_1.deleteForm);
router
    .route('/:id/responses')
    .get(verifyJWT_1.default, formResponseController_1.getAllResponses)
    .post(formResponseController_1.createResponse);
exports.default = router;
