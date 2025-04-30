// Importing necessary functions from the Arcjet Node.js SDK
// - arcjet: Main function to initialize Arcjet
// - shield: Rule for basic protection
// - detectBot: Rule for bot detection
// - tokenBucket: Rule for rate limiting
import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";

// Importing the Arcjet API key from environment variables
import { ARCJET_KEY } from "./env.js";

// Initialize Arcjet with configuration
const aj = arcjet({
    // Required API key for authenticating with Arcjet services
    key: ARCJET_KEY,

    // Characteristics used to identify requests
    // Here we're using the source IP address to track requests
    characteristics: ["ip.src"],

    // Array of security rules to apply to incoming requests
    rules: [
        // 1. Basic Shield Protection
        // - LIVE mode means it will actively block malicious requests
        shield({ 
            mode: "LIVE" 
        }),

        // 2. Bot Detection Rule
        // - LIVE mode enables active bot detection
        detectBot({
            mode: "LIVE",
            allow: ["CATEGORY:SEARCH_ENGINE"],
        }),

        // 3. Rate Limiting using Token Bucket Algorithm
        tokenBucket({
            mode: "LIVE",     // Enforces rate limiting in real-time
            refillRate: 5,    // Number of tokens added per interval
            interval: 10,     // Time interval in seconds for refill
            capacity: 10,     // Maximum tokens available at any time
        }),
    ],
});

export default aj;