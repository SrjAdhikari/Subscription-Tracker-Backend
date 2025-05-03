// Import Express Router to define modular route handlers
import { Router } from "express";

// Import middleware to protect routes that require authentication
import authorize from '../middlewares/auth.middleware.js';

// Import all controller functions for handling subscription logic
import { 
    cancelSubscription,
    createSubscription, 
    deleteSubscription, 
    getAllSubscriptions, 
    getSpecificSubscription, 
    getUserSubscriptions, 
    updateSubscription
} from "../controllers/subscription.controller.js";


//* =========================================================
//* 🔐 SUBSCRIPTION ROUTER - HANDLES SUBSCRIPTION ENDPOINTS
//* ✅ BASE ROUTE : /api/v1/subscriptions
//* =========================================================

// Create a new instance of the Express Router
const subscriptionRouter = Router();


// ✅ Get all subscriptions
subscriptionRouter.get("/", getAllSubscriptions);


// ✅ Get user-specific subscriptions
subscriptionRouter.get("/user/:id", authorize, getUserSubscriptions);


// ✅ Create a subscription
subscriptionRouter.post("/", authorize, createSubscription);


// ✅ Update a subscription by ID
subscriptionRouter.put("/:id", authorize, updateSubscription);


// ✅ Delete a subscription by ID
subscriptionRouter.delete("/:id", authorize, deleteSubscription);


// ✅ Cancel a subscription by ID 
subscriptionRouter.put("/:id/cancel", authorize, cancelSubscription);


// ✅ Get a specific subscription by ID
subscriptionRouter.get("/:id", getSpecificSubscription);

export default subscriptionRouter;