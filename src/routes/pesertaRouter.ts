import { Router } from "express";
import { PesertaController } from "../controllers/pesertaController";

const pesertaRouter = Router();

pesertaRouter.delete("/peserta/delete", PesertaController.deleteAllPeserta);
pesertaRouter.delete("/peserta/:id", PesertaController.deletPeserta);
pesertaRouter.delete(
  "/peserta/month/:month",
  PesertaController.deletPesertaByMonth
);

export default pesertaRouter;
