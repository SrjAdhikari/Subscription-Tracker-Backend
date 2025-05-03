// Import required modules
import express from "express";
import cookieParser from "cookie-parser";

// Import environment variables
import { PORT, NODE_ENV } from "./config/env.js";

// Import route handlers
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import workflowRouter from "./routes/workflow.routes.js";

// Import database connection function
import connectToDatabase from "./database/mongodb.js";

// Import global error handler middleware
import errorMiddleware from "./middlewares/error.middleware.js";

// Import Arcjet middleware for protection/logging
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";


// Create an instance of the Express app
const app = express();


//* ==========================================
//* 🔌 Core Middleware
//* ==========================================

// Middleware to parse incoming JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded data
app.use(express.urlencoded({extended: false}));

// Middleware to parse cookies from the request
app.use(cookieParser());

// Custom security or analytics middleware
app.use(arcjetMiddleware);


//* ==========================================
//* 🚦 API Routes
//* ==========================================

// Authentication routes
app.use("/api/v1/auth", authRouter);

// User management routes
app.use("/api/v1/users", userRouter);

// Subscription management routes
app.use("/api/v1/subscriptions", subscriptionRouter);

// Workflow integration routes
app.use("/api/v1/workflows", workflowRouter);


//* ==========================================
//* 🚨 Error Handling
//* ==========================================

// Global error handler
app.use(errorMiddleware);


//* ==========================================
//* 🏠 Home Route
//* ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the Subscription Tracker API",
        environment: NODE_ENV
    });
});


//* ==========================================
//* 🚀 Server Initialization
//* ==========================================

const startServer = async () => {
    try {
        // Connect to database
        await connectToDatabase();
        console.log("✅ Database connected successfully");
        
        // Start Express server
        app.listen(PORT, () => {
            console.log(`✅ Server running in ${NODE_ENV} mode on port ${PORT}`);
            console.log(`🔗 http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);    // Exit with failure code
    }
};

// Start the application
startServer();