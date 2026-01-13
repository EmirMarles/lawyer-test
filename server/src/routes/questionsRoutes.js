import express from 'express'
import { getQuestions, checkAnswers } from '../controllers/questionsControllers.js'

const router = express.Router();

router.get("/getQuestions", getQuestions)

router.post("/checkAnswers", checkAnswers )

export default router;