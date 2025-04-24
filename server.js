import express from "express"
import dotenv from 'dotenv';
import cron from "node-cron"
import githubRoutes from "./src/routes/githubRoutes.js"
import { fetchAndStoreGitHubData } from "./src/services/githubServices.js";
import { connectDb } from "./src/config/mongoDb.js";
import cors from "cors"

dotenv.config();
const app = express()
app.use(cors({
    origin: 'http://localhost:5173', // replace with your real frontend URL
    methods: ['GET', 'POST'],
    credentials: true
}));

const PORT = 9000;
app.use(express.json())
app.use("/api/v1/contribution", githubRoutes)

app.listen(PORT, async () => {
    await connectDb();
    console.log(`App listening on Port ${PORT}`)
})

// Schedule to run daily at midnight (00:00)
cron.schedule('0 1 * * *', async () => {
    try {
        console.log('Running GitHub data fetch task...');
        await fetchAndStoreGitHubData();
        console.log('GitHub data fetch complete.');
    } catch (err) {
        console.error("Cron job failed:", err.message);
    }
});