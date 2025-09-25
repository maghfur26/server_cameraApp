import express from "express";
import { getUser } from "../controllers/userController.js";
const userRoutes = express.Router();
userRoutes.get("/users", getUser);
export default userRoutes;
//# sourceMappingURL=userRoutes.js.map