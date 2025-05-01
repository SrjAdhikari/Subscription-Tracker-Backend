import mongoose from "mongoose";
import bcrypt from "bcryptjs";                                      // Library for password hashing
import jwt from "jsonwebtoken";                                     // Library for JWT token generation

import User from "../models/user.model.js";                         // User model/schema
import BlacklistedToken from '../models/blacklistedToken.model.js'; // BlacklistedToken model/schema
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";      // JWT configuration


//* ===========================
//* ✅ SIGNUP CONTROLLER
//* ===========================

export const signUp = async (req, res, next) => {
    // Start a MongoDB transaction session for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Extract user data from request body
        const { name, email, password } = req.body;

        // Check if a user with the provided email already exists
        const existingUser = await User.findOne({ email });

        // If user exists, throw a conflict error (HTTP 409)
        if(existingUser) {
            const error = new Error("User aleady exists");
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);                      // Generate salt
        const hashPassword = await bcrypt.hash(password, salt);     // Hash password

        // Create a new user in the database within the transaction session
        const newUsers = await User.create(
            [{name, email, password: hashPassword}],
            { session }
        );

        // Generate JWT token for authentication
        const token = jwt.sign(
            {userId: newUsers[0]._id},      // Payload
            JWT_SECRET,                     // Secret key
            {expiresIn: JWT_EXPIRES_IN}     // Token expiration
        );

        // Commit transaction if everything succeeded
        await session.commitTransaction();
        session.endSession();

        // Send success response
        res.status(201).json({
            success: true,
            messsage: "User created successfully",
            data: {
                token,
                user: newUsers[0]
            }
        });
    } catch (error) {
        // If an error occurs, abort the transaction to rollback changes
        await session.abortTransaction();
        session.endSession();

        // Pass error to error handling middleware
        next(error);
    }
};


//* ===========================
//* ✅ SIGNIN CONTROLLER
//* ===========================

export const signIn = async (req, res, next) => {
    try {
        // Extract email and password from the request body
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // If no user is found, throw a not found error (HTTP 404)
        if(!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // If the password is invalid, throw an unauthorized error (HTTP 401)
        if(!isPasswordValid) {
            const error = new Error("Invalid password");
            error.statusCode = 401;
            throw error;
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },           // Payload
            JWT_SECRET,                     // Secret key
            { expiresIn: JWT_EXPIRES_IN }   // Token expiration
        );

        // Send success response
        res.status(200).json({
            status: true,
            message: "User signed in successfully",
            data: {
                token,
                user,
            }
        });
    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};


//* ===========================
//* ✅ SIGNOUT CONTROLLER
//* ===========================

export const signOut = async (req, res, next) => {
    try {
        // Extract the JWT from the Authorization header
        const authHeader = req.headers.authorization;

        // Validate Authorization header exists and has correct format
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required"
            });
        }

        // Extract the token
        const token = authHeader.split(' ')[1];

        // Alternative way of extract token
        // const token = req.cookies.jwt;

        // Verify and decode the token
        let decoded;
        try {
            // Verify token signature and decode payload
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            // Handle different JWT verification errors
            if (error.name === "TokenExpiredError") {
                // Token is valid but expired - still needs to be blacklisted
                return res.status(401).json({
                    success: false,
                    message: "Token has expired"
                });
            }

            // Handle other JWT errors (invalid signature, malformed token, etc.)
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        // Check if token is already blacklisted (prevent duplicate entries)
        const existingBlacklisted = await BlacklistedToken.findOne({ token });
        if (existingBlacklisted) {
            return res.status(200).json({
                success: true,
                message: "Token already invalidated"
            });
        }

        // Add token to blacklist with expiration
        await BlacklistedToken.create({
            token,
            expiresAt: new Date(decoded.exp * 1000),    // Convert JWT expiration timestamp to Date
            userId: decoded.userId,                     // Store user reference for auditing
            invalidatedAt: new Date()                   // Track when token was invalidated
        });

        // Clear client-side tokens (via cookies if used)
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        // Send success response
        res.status(200).json({
            success: true,
            message: "User signed out successfully",
            data: {
                invalidatedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};