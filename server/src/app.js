import express from 'express'
import questionsRoutes from './routes/questionsRoutes.js'
import helmet from 'helmet'
import path from "path";
import { fileURLToPath } from 'url';
import cors from 'cors'

const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

// Answer token with 100 questions can exceed 100KB; allow larger payload for checkAnswers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(cors({
    origin: (origin, callback) => {
        const allowed = [
            'http://localhost:5173',
            process.env.FRONTEND_URL
        ].filter(Boolean);
        const isAllowed = !origin || allowed.includes(origin) || (typeof origin === 'string' && origin.endsWith('.onrender.com'));
        callback(null, isAllowed);
    },
    methods: ['GET', 'POST']
}))
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],       // allow your own server
                imgSrc: ["'self'", "data:"], // allow images & favicons
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
            },
        },
    })
);

app.use("/api/questions", questionsRoutes)


export default app;