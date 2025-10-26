import { getUsers } from "../services/user.service";
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
//# sourceMappingURL=user.controller.js.map