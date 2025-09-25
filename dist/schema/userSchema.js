import Joi from "joi";
export const userSchema = Joi.object({
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
        .required(),
    role: Joi.string().valid("USER", "ADMIN").optional(),
});
//# sourceMappingURL=userSchema.js.map