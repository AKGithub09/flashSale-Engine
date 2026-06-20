import arcjet, { detectBot, tokenBucket} from "@arcjet/node";
import { ARCJET_KEY } from "../config/envConfig.js";

// configure arcjet with your API key
const aj = arcjet({
  key: ARCJET_KEY,
  characteristics: ["ip.src"], // Track clients based on their IP address
  rules: [
    // Rule 1: Anti-Bot protection targeting headless script crawlers/snipers
    detectBot({
      mode: "LIVE", // actively blocks bots in live mode, or just logs them in test mode
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR", 
        "CATEGORY:TOOL"
      ] // allow search engine bots to pass through
    }), 
    // Rule 2: Token bucket rate limiting to slow down brute force attacks
    tokenBucket({
      mode: "LIVE", // actively blocks clients in live mode, or just logs them in test mode
      capacity: 10, // Max burst allowance 
      refillRate: 5,// refill 5 tokens every 10 seconds
      interval: 10, // refill every 10 seconds
      requested: 1 // each request costs 1 token
    }),
  ] 
});

export const securityShield = async (req, res, next) => {
  try{
    const decision = await aj.protect(req, {requested: 1});

    if(decision.isDenied()){
      if(decision.reason.isBot()){
        // If the request is denied, respond with a 403 Forbidden status
        return res.status(403).json({success: false, message: "Access denied bots are not allowed"});
      };
      return res.status(429).json({success: false, message: "Too many requests, please try again later"});
    }

    next() // Safe passage to the controller
  }catch(err){
    console.error('Error in Arcjet middleware:', err);
    next(); // Fallback pass-through to ensure API availability if Arcjet has a network blip
  }
}