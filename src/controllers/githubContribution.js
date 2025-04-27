import axios from "axios";
import { fetchAndStoreGitHubData } from "../services/githubServices.js";

// Check if rate limit is exceeded
async function checkRateLimit(token) {
    try {
        const rateLimitResponse = await axios.get("https://api.github.com/rate_limit", {
            headers: { Authorization: `token ${token}` }
        });
        console.log(`Remaining requests: ${rateLimitResponse.data.resources.core.remaining}`);
        return rateLimitResponse.data.resources.core.remaining;
    } catch (error) {
        console.error("Error checking rate limit:", error.message);
        throw new Error("Rate limit check failed");
    }
}

// Fetch commits from a repository
async function fetchCommits(repoName, username, token) {
    const commitsUrl = `https://api.github.com/repos/${username}/${repoName}/commits`;
    let page = 1;
    let hasMoreCommits = true;
    const contributionData = {};
    let earliestDate = null;

    while (hasMoreCommits) {
        try {
            const commitsResponse = await axios.get(`${commitsUrl}?author=${username}&page=${page}&per_page=100`, {
                headers: { Authorization: `token ${token}` }
            });

            if (commitsResponse.data.length < 100) {
                hasMoreCommits = false;
            }

            commitsResponse.data.forEach(commit => {
                const date = commit.commit.author.date.split('T')[0];
                if (!contributionData[date]) {
                    contributionData[date] = 0;
                }
                contributionData[date]++;

                // Update earliest date
                if (!earliestDate || new Date(date) < new Date(earliestDate)) {
                    earliestDate = date;
                }
            });

            page++;
        } catch (error) {
            console.error(`Error fetching commits from ${repoName}:`, error.message);
            hasMoreCommits = false;
        }
    }

    return { contributionData, earliestDate };
}

// Collect GitHub data for the user
export async function collectGitHubData(username, token) {
    const contributionData = {};
    let earliestCommitDate = null;

    // Check if we have rate limit remaining before fetching data
    const remainingRequests = await checkRateLimit(token);
    if (remainingRequests <= 0) {
        throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
        const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, {
            headers: { Authorization: `token ${token}` }
        });

        for (const repo of reposResponse.data) {
            const { contributionData: repoContributionData, earliestDate } = await fetchCommits(repo.name, username, token);

            // Update the earliest commit date
            if (earliestCommitDate === null || (earliestDate && new Date(earliestDate) < new Date(earliestCommitDate))) {
                earliestCommitDate = earliestDate;
            }

            // Merge commit data from the repository
            for (const date in repoContributionData) {
                if (!contributionData[date]) {
                    contributionData[date] = 0;
                }
                contributionData[date] += repoContributionData[date];
            }
        }

        // Ensure every date between the earliest commit and today is included
        const today = new Date();
        let currentDate = new Date(earliestCommitDate);
        while (currentDate <= today) {
            const dateString = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            if (!contributionData[dateString]) {
                contributionData[dateString] = 0;
            }
            currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
        }

        return contributionData;

    } catch (error) {
        console.error("Failed to collect GitHub data:", error.message);
        throw new Error('Error collecting GitHub data');
    }
}

// Endpoint to fetch and store all contributions
export async function fetchAndStoreAllContributions(req, res) {
    try {
        await fetchAndStoreGitHubData();
        res.json({ message: 'GitHub contributions successfully updated.' });
    } catch (error) {
        console.error('Failed to fetch and store GitHub data:', error.message);
        res.status(500).json({ error: 'Something went wrong.' });
    }
}
