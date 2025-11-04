import { Request, Response } from "express";
export declare class PesertaController {
    static deletPeserta(req: Request, res: Response): Promise<Response<any, Record<string, any>> | import("../utils/errorHandler").AppError>;
    static deletPesertaByMonth(req: Request, res: Response): Promise<Response<any, Record<string, any>> | import("../utils/errorHandler").AppError>;
    static deleteAllPeserta(req: Request, res: Response): Promise<Response<any, Record<string, any>> | import("../utils/errorHandler").AppError>;
}
//# sourceMappingURL=pesertaController.d.ts.map