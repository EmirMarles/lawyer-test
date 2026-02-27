import express from 'express'
import { getQuestions, getQuestionsByCategory, checkAnswers } from '../controllers/questionsControllers.js'

const router = express.Router();

router.get("/getQuestions", getQuestions)
router.get("/by-category", getQuestionsByCategory)

router.post("/checkAnswers", checkAnswers )

export default router;