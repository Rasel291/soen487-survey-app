import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { sumbitResponse } from "../controllers/responseController";

const router = Router();

router.post("/:id", verifyToken, sumbitResponse);

export default router;