import { Router } from "express";
import { resumir } from "./handler";

const router = Router();

router.post('/resumir', resumir)

export default router