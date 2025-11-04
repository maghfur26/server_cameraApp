"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PesertaController = void 0;
const pesertaService_1 = require("../services/pesertaService");
const errorHandler_1 = require("../utils/errorHandler");
class PesertaController {
    static async deletPeserta(req, res) {
        try {
            const Id = req.params.id;
            if (!Id) {
                return (0, errorHandler_1.handleServiceError)(new Error("ID_NOT_FOUND"));
            }
            const peserta = await pesertaService_1.PesertaService.deletePeserta(Id);
            return res.status(200).json({
                success: true,
                message: "Peserta berhasil dihapus",
                data: peserta,
            });
        }
        catch (error) {
            return (0, errorHandler_1.handleServiceError)(error);
        }
    }
    static async deletPesertaByMonth(req, res) {
        try {
            const result = await pesertaService_1.PesertaService.deletePesertaByMonth(Number(req.params.month));
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result,
            });
        }
        catch (error) {
            return (0, errorHandler_1.handleServiceError)(error);
        }
    }
    static async deleteAllPeserta(req, res) {
        try {
            const result = await pesertaService_1.PesertaService.deleteAllPeserta();
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result,
            });
        }
        catch (error) {
            return (0, errorHandler_1.handleServiceError)(error);
        }
    }
}
exports.PesertaController = PesertaController;
//# sourceMappingURL=pesertaController.js.map