//* ==========================================
//* 📛 CENTRALIZED ERROR HANDLING MIDDLEWARE
//* ==========================================


const errorMiddleware = (err, req, res, next) => {
    try {
        // Default error response values
        let statusCode = err.statusCode || 500;
        let message = err.message || "Server Error";

        // Handle Mongoose bad ObjectId error (invalid MongoDB _id)
        if(err.name === "CastError") {
            statusCode = 404;
            message = "Resource not found";
        }

        // Handle Mongoose duplicate key error (e.g., unique fields like email already exist)
        if(err.code === 11000) {
            statusCode = 400;
            message = "Duplicate field value entered";
        }

        // Handle Mongoose validation error (e.g., required fields or invalid formats)
        if(err.name === "ValidationError") {
            statusCode = 400;

            // Extract all validation error messages and combine them into one string
            message = Object.values(err.errors)
                    .map(val => val.message)
                    .join(", ");
        }

        // Send the error response with appropriate status code and message
        res.status(statusCode).json({
            success: false,
            error: message,
        });
    } catch (error) {
        // Pass error to error handling middleware
        next(error);
    }
};

export default errorMiddleware;