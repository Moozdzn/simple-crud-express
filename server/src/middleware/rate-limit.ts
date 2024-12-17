import { rateLimit } from "express-rate-limit";
import env from "../utils/env";

// https://express-rate-limit.mintlify.app/quickstart/usage#using-the-library
const rateLimiter = rateLimit({
	legacyHeaders: true,
	standardHeaders: true,
	limit: env.RATE_LIMIT_MAX_REQUESTS,
	message: "Too many requests, please try again later.",
	windowMs: 15 * 60 * env.RATE_LIMIT_WINDOW_MS,
});

export default rateLimiter;
