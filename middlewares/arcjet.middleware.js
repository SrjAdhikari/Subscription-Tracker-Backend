// Importing the Arcjet configuration instance
import aj from '../config/arcjet.js';


// Arcjet middleware function to protect routes from abusive behavior
const arcjetMiddleware = async (req, res, next) => {
    try {
        // Call Arcjet's protect method with the incoming request and an optional metadata object
        const decision = await aj.protect(req, { requested: 1 });

        // If the request is denied based on Arcjet's analysis
        if(decision.isDenied()) {

           // Specific reason: too many requests from the client (rate limiting)
            if(decision.reason.isRateLimit()) 
                return res.status(429).json({ 
                    error: 'Rate limit exceeded' 
                });

            // Specific reason: request identified as coming from a bot
            if(decision.reason.isBot()) 
                return res.status(403).json({ 
                    error: 'Bot detected' 
                });

            // Generic denial reason (not rate limit or bot)
            return res.status(403).json({ 
                error: 'Access denied' 
            });
        }

        // If not denied, pass control to the next middleware or route handler
        next();
    } catch (error) {
        // Log any unexpected errors from the Arcjet protect call
        console.log(`Arcjet Middleware Error: ${error}`);

        // Forward the error to the next middleware/error handler
        next(error);
    }
}

export default arcjetMiddleware;