import mongoose from "mongoose";
import { DB_URI } from "../config/env.js";


// Validate that the DB_URI is defined before attempting a connection
if(!DB_URI) {
    throw new Error(
        "MONGODB_URI environment variable is not defined.\n" +
        "Please add it to your .env.<environment>.local file"
    );
}

// Establishes connection to MongoDB database
const connectToDatabase = async () => {
    try {
        // Attempt database connection
        await mongoose.connect(DB_URI);
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error.message);

        // Exit process with failure code if connection fails
        process.exit(1);
    }
}

export default connectToDatabase;