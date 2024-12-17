import express, { type Router } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from './swagger.json'

const APIDocsRouter: Router = express.Router();

APIDocsRouter.use('/', swaggerUi.serve)
APIDocsRouter.get("/", swaggerUi.setup(swaggerDocument));

export default APIDocsRouter