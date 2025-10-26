import { Router } from "express";
import { PesertaController } from "../controllers/pesertaController";

const pesertaRouter = Router();

pesertaRouter.delete("/peserta/:id", PesertaController.deletPeserta);

export default pesertaRouter;
