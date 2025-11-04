"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const spredseetRouter_1 = __importDefault(require("./routes/spredseetRouter"));
const pesertaRouter_1 = __importDefault(require("./routes/pesertaRouter"));
const handlerMulet_1 = __importDefault(require("./helper/handlerMulet"));
const corsConfig_1 = __importDefault(require("./config/corsConfig"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
app.use(corsConfig_1.default);
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api", userRoutes_1.default);
app.use("/api", uploadRoutes_1.default);
app.use("/api", spredseetRouter_1.default);
app.use("/api", pesertaRouter_1.default);
// Error handler untuk multer
app.use(handlerMulet_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map