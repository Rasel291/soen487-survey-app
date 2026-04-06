import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import {
  getSurveys,
  getSurveyById,
  getPublicSurveyByToken,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  publishSurvey,
  closeSurvey,
} from "../controllers/surveyController";

const router = Router();

router.get("/", verifyToken, getSurveys);
router.get("/public/:id", getPublicSurveyByToken);
router.get("/:id", verifyToken, getSurveyById);
router.post("/", verifyToken, createSurvey);
router.put("/:id", verifyToken, updateSurvey);
router.delete("/:id", verifyToken, deleteSurvey);
router.post("/:id/publish", verifyToken, publishSurvey);
router.post("/:id/close", verifyToken, closeSurvey);

export default router;
