import express from 'express';
import { fetchAndStoreAllContributions } from "../controllers/githubContribution.js"
import { fetchAllContributionFromDatabase } from '../controllers/fetchAllContributionFromDatabase.js';

const router = express.Router();

router.post('/github/fetch-all', fetchAndStoreAllContributions);
router.get("/", fetchAllContributionFromDatabase)

export default router;
