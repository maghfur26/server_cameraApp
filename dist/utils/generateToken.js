"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAccessToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dbconfig_1 = __importDefault(require("../config/dbconfig"));
const generateToken = (type, payload) => {
    const secret = type === "accessToken"
        ? process.env.ACCESS_TOKEN_SECRET
        : process.env.REFRESH_TOKEN_SECRET;
    const expiresIn = type === "accessToken" ? "15m" : "7d";
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.sign(payload, secret, { expiresIn }, (err, token) => {
            if (err || !token)
                return reject(err ?? new Error("No token generated"));
            resolve(token);
        });
    });
};
exports.generateToken = generateToken;
const updateAccessToken = async (userId, accessToken) => {
    await dbconfig_1.default.user.update({
        where: {
            id: userId,
        },
        data: {
            accessToken,
        },
    });
};
exports.updateAccessToken = updateAccessToken;
//# sourceMappingURL=generateToken.js.map