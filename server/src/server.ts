import express, { type Express, type ErrorRequestHandler } from "express";
import helmet from 'helmet'
import cors from 'cors'

import rateLimiter from './middleware/rate-limit'
import ProductRouter from "./api/product/productController";
import APIDocsRouter from "./api-docs";
import { join } from "node:path";

const app: Express = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(rateLimiter)

// https://stackoverflow.com/a/58165719/11689544
app.use(((err, req, res, next) => {
    //@ts-ignore
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(400).json({ error: "Body is not a valid JSON" });
        return; 
    }
    res.status(500).json({ error: err.message })
}) as ErrorRequestHandler)

app.use("/api/v1/products", ProductRouter);
app.use("/api-docs", APIDocsRouter);
app.use(express.static(join(__dirname, process.env.NODE_ENV === "development" ? "public/react" : "react")));

export default app
