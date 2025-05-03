// Import Express Router to define modular route handlers
import { Router } from "express";

// Import controller functions for handling user logic
import { 
    createUser,
    getUser,
    getUsers,
    updateUser,
    deleteUser
} from "../controllers/user.controller.js";

// Middleware to validate authentication
import authorize from '../middlewares/auth.middleware.js'

// Middleware to validate registration data
import register from "../middlewares/register.middleware.js";


//* ==========================================
//* 🔐 USER ROUTER - HANDLES USER ENDPOINTS
//* ✅ BASE ROUTE : /api/v1/users
//* ==========================================

// Create a new instance of the Express Router
const userRouter = Router();


// ✅ Get all users
userRouter.get("/", getUsers);


// ✅ Get a specific user by ID
userRouter.get("/:id", authorize, getUser);


// ✅ Create a new user
userRouter.post("/", register, createUser);


// ✅ Update a user by ID
userRouter.put("/:id", authorize, updateUser);


// ✅ Delete a user by ID
userRouter.delete("/:id", authorize, deleteUser);

export default userRouter;