// Import the 'config' function from the 'dotenv' package.
// dotenv is used to load environment variables from a .env file into process.env
import { config } from "dotenv";

// Load environment variables from a specific .env file based on the current NODE_ENV
config({
    path: `.env.${process.env.NODE_ENV || "development"}.local`
});

// Destructure and export specific environment variables from process.env
export const {
    // Server configuration
    PORT,                           // Port number the server should listen on
    NODE_ENV,                       // Current environment (development, production, test, etc.)
    SERVER_URL,                     // Base URL of the server

    // Database configuration
    DB_URI,                         // Connection URI for the database

    // Authentication (JWT) configuration
    JWT_SECRET,                     // Secret key for signing JSON Web Tokens
    JWT_EXPIRES_IN,                 // Expiration time for JWTs (e.g., "1d" for 1 day)

    // Arcjet security configuration
    ARCJET_ENV,                     // Environment for Arcjet (e.g., "development" or "production")
    ARCJET_KEY,                     // API key for Arcjet security services

    // QStash (queue service) configuration
    QSTASH_TOKEN,                   // Authentication token for QStash
    QSTASH_URL,                     // URL endpoint for QStash service

    // Email service configuration
    EMAIL_PASSWORD,                 // Password for email service authentication
} = process.env;



//*********************************************
//* Explanation of code
//*********************************************

// import the `config` function from the `dotenv` package. 
// `dotenv` is used to load environment variables from a `.env` file into `process.env`. 
// So, `config()` is typically called without arguments to load the default `.env` file. 
// But here, we're passing an options object with a `path` property. 
// The path is a template string that constructs the filename based on `process.env.NODE_ENV`. 
// If `NODE_ENV` isn't set, it defaults to "development", and appends ".local" to the filename. 
// So the files would be like `.env.development.local` or `.env.production.local`, depending on the environment.


//* why use different `.env` files? 
// It's for environment-specific configurations. For example, development might use a local database, while production uses a live one. 
// The `.local` suffix might be for ignoring these files in version control, keeping sensitive data secure.