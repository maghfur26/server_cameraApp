import { PesertaService } from "../services/pesertaService";
import { Request, Response } from "express";
import { handleServiceError } from "../utils/errorHandler";

export class PesertaController {
  static async deletPeserta(req: Request, res: Response) {
    try {
      const Id = req.params.id;

      if (!Id) {
        return handleServiceError(new Error("ID_NOT_FOUND"));
      }

      const peserta = await PesertaService.deletePeserta(Id);

      return res.status(200).json({
        success: true,
        message: "Peserta berhasil dihapus",
        data: peserta,
      });
    } catch (error : any) {
      return handleServiceError(error);
    }
  }
}
