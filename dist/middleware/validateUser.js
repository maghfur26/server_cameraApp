import { userSchema } from "../schema/userSchema.js";
export const validateUser = (req, res, next) => {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: "validation error",
            details: error?.details.map((detail) => detail.message),
        });
    }
    req.body = value;
    next();
};
//# sourceMappingURL=validateUser.js.map