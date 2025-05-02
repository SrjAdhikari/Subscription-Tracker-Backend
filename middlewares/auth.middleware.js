// Import required modules
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/env.js";


// Middleware to authorize users based on JWT token
const authorize = async (req, res, next) => {
    try {
        let token;

         // Check if the Authorization header is present and starts with "Bearer"
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            // Extract the token from the Authorization header
            token = req.headers.authorization.split(" ")[1];
        }

        // Alternative way of extract token from cookies
        // const token = req.cookies.jwt;

        // If no token is found, respond with 401 Unauthorized
        if(!token) {
            res.status(401).json({
                message: "Unauthorized",
            });
        }

        // Verify the token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find the user associated with the token payload
        const user = await User.findById(decoded.userId);

        // If the user doesn't exist in the database, respond with 401 Unauthorized
        if(!user) {
            res.status(401).json({
                message: "Unauthorized",
            });
        }

        // Attach the authenticated user to the request object for downstream access
        req.user = user;

        // Call the next middleware or route handler
        next();
    } catch (error) {
        // Catch any errors during token verification or database query
        res.status(401).json({
            message: "Unauthorized",
            error: error.message,
        });
    }
};

export default authorize;