import express from 'express';
import { fetchAndStoreAllContributions } from "../controllers/githubContribution.js"

const router = express.Router();

router.post('/github/fetch-all', fetchAndStoreAllContributions);

export default router;
