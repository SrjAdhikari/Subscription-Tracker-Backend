// Import Mongoose for schema and model creation
import mongoose from "mongoose";

// Destructure Schema from mongoose for cleaner syntax
const { Schema } = mongoose;


// BlacklistedToken Schema Definition
const blacklistedTokenSchema = new Schema({
    // The JWT token string being blacklisted
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,                // Create index for faster token lookups
    },

    // Reference to the user this token belongs to
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",                // Establishes relationship with User model
        required: true,
        index: true,                // Index for faster user-based queries
    },

    // When the token naturally expires (matches JWT expiration)
    expiresAt: {
        type: Date,
        required: true,
        validate: {
            validator: (value) => value > new Date(),
            message: "Expiration date must be in the future",
        }
    },

    // When the token was explicitly invalidated
    invalidatedAt: {
        type: Date,
        default: Date.now,          // Automatically set to current time
        immutable: true             // Cannot be modified after creation
    }
}, { timestamps: true });


// Add TTL ((Time-To-Live)) Index Configuration
// Automatically removes documents when expiresAt time is reached
blacklistedTokenSchema.index(
    { expiresAt: 1 },               // Index on expiresAt field  (1 = ascending)
    { expireAfterSeconds: 0 }       // Documents expire exactly at expiresAt time
);


// Compound Index for User-Centric Queries
// Optimizes queries that filter by userId and expiresAt together
blacklistedTokenSchema.index(
    { 
        userId: 1,                  // First part of compound index (ascending)
        expiresAt: 1                // Second part of compound index (ascending)
    }
);


// Create the Mongoose model from the schema
const BlacklistedToken = mongoose.model(
    "BlacklistedToken", 
    blacklistedTokenSchema
);

export default BlacklistedToken;