import type { NextFunction, Request, Response } from "express";

/* A simple mock middleware to simulate user authentication on POST / PUT / DELETE */
export default function auth(req: Request, res: Response, next: NextFunction) {
    if (req.method === "POST" || req.method === "PUT" || req.method === "DELETE") {
		// authenticate user
		req.user = { mail: "user@example.com" };
	}
	next();
}