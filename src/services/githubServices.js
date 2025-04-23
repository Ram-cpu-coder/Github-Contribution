import { collectGitHubData } from "../controllers/githubContribution.js";
import Contribution from "../schema/githubSchema.js";
const username = process.env.GITHUB_USERNAME;
const token = process.env.GITHUB_TOKEN;

export async function fetchAndStoreGitHubData() {
    if (!username || !token) {
        throw new Error("GitHub username and token must be provided.");
    }

    const data = await collectGitHubData(username, token);

    const entries = Object.entries(data).map(([date, count]) => ({
        username,
        date,
        count
    }));

    await Promise.all(entries.map(entry =>
        Contribution.updateOne(
            { username, date: entry.date },
            { $set: { count: entry.count } },
            { upsert: true }
        )
    ));
}
