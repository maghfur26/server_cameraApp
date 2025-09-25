import prisma from "../config/dbconfig.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                userName: true,
                email: true,
                role: true,
            },
        });
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json({
            message: "Users retrieved successfully",
            data: users,
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const createUser = async (req, res) => {
    try {
        const { userName, email, password, role } = req.body;
        const saltRounds = parseInt(process.env.SALT_ROUNDS || "12");
        const salt = await bcrypt.genSalt(saltRounds);
        // Check existing user
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create user
        const newUser = await prisma.user.create({
            data: {
                userName,
                email,
                password: hashedPassword,
                role,
            },
        });
        return res.status(201).json({
            message: "User created successfully",
        });
    }
    catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const payload = {
            id: user.id,
            email,
            userName: user.userName,
            role: user.role,
        };
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const refreshToken = await generateToken("refreshToken", payload);
        const accessToken = await generateToken("accessToken", payload);
        await prisma.user.update({
            where: {
                email,
            },
            data: {
                accessToken,
                refreshToken,
            },
        });
        return res.status(200).json({
            message: "login success",
            token: accessToken,
        });
    }
    catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=userService.js.map