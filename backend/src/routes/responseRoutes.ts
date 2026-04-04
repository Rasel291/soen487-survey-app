import { Router } from "express";
import { submitPublicResponse } from "../controllers/responseController";

const router = Router();

router.post("/public/:id", submitPublicResponse);

export default router;