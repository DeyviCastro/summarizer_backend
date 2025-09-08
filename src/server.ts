import express from "express";
import router from "./router";
import cors from "cors";
import dotenv from "dotenv";
import { corsConfig } from "./config/cors";
dotenv.config();

const app = express();

app.use(cors(corsConfig));
app.use('/', router)

export default app