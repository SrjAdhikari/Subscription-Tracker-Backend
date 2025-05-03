// Import the Express Router to define route handlers
import { Router } from "express";

// Import controller functions to handle authentication logic
import { signUp, signIn, signOut } from "../controllers/auth.controller.js";

// Middleware to validate authentication
import authorize from "../middlewares/auth.middleware.js";

// Middleware to validate registration data
import register from "../middlewares/register.middleware.js";


//* ==========================================
//* 🔐 AUTH ROUTER - HANDLES AUTH ENDPOINTS
//* ✅ BASE ROUTE : /api/v1/auth
//* ==========================================

// Create a new instance of the Express Router
const authRouter = Router();


// ✅ Register a new user
authRouter.post("/sign-up", register, signUp);


// ✅ Log in a user
authRouter.post("/sign-in", signIn);


// ✅ Log out a user
authRouter.post("/sign-out", authorize, signOut);

export default authRouter;