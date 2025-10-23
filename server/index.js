import express from 'express';
import cors from 'cors';
import commentsRouter from './api/comments.js';
import likesRouter from './api/likes.js';

const app = express();

const ALLOW = [
    'http://localhost:5173',            // dev
    'https://dev-journey-wr.vercel.app' // prod
];

app.use((req, res, next) => {
    res.setHeader('Access-Control-Max-Age', '600');
    next();
});

app.use(cors({
    origin: (origin, cb) => cb(null, !origin || ALLOW.includes(origin)),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
    credentials: true,
}));

app.options('*', cors());

app.use(express.json());

// import commentsRouter from './api/comments.js';
// import likesRouter from './api/likes.js';
app.use('/api/comments', commentsRouter);
app.use('/api/likes', likesRouter);

export default app;
