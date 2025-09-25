import { getUsers } from "../services/userService.js";
export const getUser = async (req, res) => {
    try {
        const user = await getUsers(req, res);
        return user;
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=userController.js.map