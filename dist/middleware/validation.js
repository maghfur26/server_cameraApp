"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateCreateUser = void 0;
const userSchema_1 = require("../schema/userSchema");
const validateCreateUser = (req, res, next) => {
    const { error } = userSchema_1.userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.details.map((detail) => detail.message),
        });
    }
    next();
};
exports.validateCreateUser = validateCreateUser;
const validateLogin = (req, res, next) => {
    const { error } = userSchema_1.loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.details.map((detail) => detail.message),
        });
    }
    next();
};
exports.validateLogin = validateLogin;
//# sourceMappingURL=validation.js.map