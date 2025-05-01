// Import mongoose for ObjectId validation
import mongoose from "mongoose";

// Import the Subscription model for database operations
import Subscription from "../models/subscription.model.js";

// Import the Upstash workflow client for triggering background tasks
import { workflowClient } from '../config/upstash.js'

// Import server URL from environment configuration
import { SERVER_URL } from '../config/env.js'


//* =======================================
//* ✅ CONTROLLER TO CREATE SUBSCRIPTION
//* =======================================

export const createSubscription = async (req, res, next) => {
    try {
        // Create a new subscription in the database
        // Spread operator (...) includes all properties from req.body
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,     // Associate subscription with authenticated user
        });

        // Trigger a workflow in Upstash to handle subscription reminders
        const { workflowRunId } = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription.id,
            },
            headers: {
                "content-type": "application/json",
            },
            retries: 0,
        });

        // Send success response with both subscription data and workflow ID
        res.status(201).json({
            success: true,
            data: {
                subscription,       // The newly created subscription document
                workflowRunId       // ID for tracking the background workflow
            }
        });
    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};


//* ======================================================
//* ✅ CONTROLLER TO RETRIVE SPECIFIC USER SUBSCRIPTION
//* ======================================================

export const getUserSubscriptions = async (req, res, next) => {
    try {
        // Verify the authenticated user matches the requested user ID
        if(req.user.id !== req.params.id) {
            const error = new Error("You are not the owner of this account");
            error.status = 401;
            throw error;
        }

        // Find all subscriptions belonging to the specified user
        const subscriptions = await Subscription.find({ user: req.params.id });

        // Send the found subscriptions
        res.status(200).json({
            success: true,
            data: subscriptions,
        });
    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};


//* =============================================
//* ✅ CONTROLLER TO RETRIVE ALL SUBSCRIPTION
//* =============================================

export const getAllSubscriptions = async (req, res, next) => {
    try {
        // Retrieve all subscriptions from the database
        const subscriptions = await Subscription.find();

        // Check if subscriptions exist
        if(!subscriptions) {
            return res.status(404).json({
                success: false,
                message: "No subscriptions found"
            });
        }

        // Send the found subscriptions
        res.status(200).json({
            success: true,
            data: subscriptions,
        });
    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};


//* ================================================
//* ✅ CONTROLLER TO RETRIVE SPECIFIC SUBSCRIPTION
//* ================================================

export const getSpecificSubscription = async (req, res, next) => {
    try {
        // Extract subscription ID from the URL parameter
        const id = req.params.id;

        // Validate the ID format
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription ID format",
            });
        }

        // Find the subscription by ID
        const specificSubscription = await Subscription.findById(id);

        // Check if subscription exist
        if(!specificSubscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        // Send the found subscription
        res.status(200).json({
            success: true,
            data: specificSubscription,
        });
    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};


//* ================================================
//* ✅ CONTROLLER TO UPDATE SPECIFIC SUBSCRIPTION
//* ================================================

export const updateSubscription = async (req, res, next) => {
    try {
        // Extract the subscription ID from the request parameters
        const id = req.params.id;

        // Validate the ID format
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription ID format",
            });
        }

        // Extract the update data from the request body
        const updateData = req.body;

        // Find and update the subscription by ID, return the updated document
        const updatedSubscription = await Subscription.findByIdAndUpdate(
            id, updateData,
            {
                new: true,             // Return the updated document
                runValidators: true    // Enforce schema validations
            }
        );

        // Check if the subscription exists
        if(!updatedSubscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

        // Send the found subscription
        res.status(200).json({
            success: true,
            data: updatedSubscription,
        });
    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};


//* ================================================
//* ❌ CONTROLLER TO DELETE SPECIFIC SUBSCRIPTION
//* ================================================

export const deleteSubscription = async (req, res, next) => {
    try {
        // Extract the subscription ID from the request parameters
        const id = req.params.id;

        // Validate the ID format
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription ID format",
            });
        }

        // Find and delete the subscription by ID
        const deletedSubscription = await Subscription.findByIdAndDelete(id);

        // Check if the subscription exists
        if(!deletedSubscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            }); 
        }

        // Send a success response
        res.status(200).json({
            success: true,
            message: "Subscription deleted successfully",
            data: deletedSubscription,
        });

    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};


//* ================================================
//* ⛔ CONTROLLER TO CANCEL SPECIFIC SUBSCRIPTION
//* ================================================

export const cancelSubscription = async (req, res, next) => {
    try {
        // Extract the subscription ID from the request parameters
        const id = req.params.id;

        // Validate the ID format
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid subscription ID format",
            });
        }

        // Find and update the subscription to set status to 'cancelled'
        const subscription = await Subscription.findByIdAndUpdate(
            id,
            { $set: { status: "cancelled" } },
            { new: true, runValidators: true }
        );

        // Check if the subscription exists
        if(!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found",
            });
        }

         // Check if subscription already cancelled, no need to update
        if(subscription.status.toLowerCase() === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Subscription is already cancelled",
            });
        }

        // Send a success response
        res.status(200).json({
            success: true,
            message: "Subscription has been cancelled",
            data: subscription,
        });
    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};