"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pesertaController_1 = require("../controllers/pesertaController");
const pesertaRouter = (0, express_1.Router)();
pesertaRouter.delete("/peserta/delete", pesertaController_1.PesertaController.deleteAllPeserta);
pesertaRouter.delete("/peserta/:id", pesertaController_1.PesertaController.deletPeserta);
pesertaRouter.delete("/peserta/month/:month", pesertaController_1.PesertaController.deletPesertaByMonth);
exports.default = pesertaRouter;
//# sourceMappingURL=pesertaRouter.js.map