import axios from "axios";
import { fetchAndStoreGitHubData } from "../services/githubServices.js";

const username = process.env.GITHUB_USERNAME;
const token = process.env.GITHUB_TOKEN;
// checking the limit of the api call
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

// fetching the contributions or say commits 100 in each page
async function fetchCommits(repoName, username, token) {
    const commitsUrl = `https://api.github.com/repos/${username}/${repoName}/commits`;
    let page = 1;
    let hasMoreCommits = true;
    const contributionData = {};

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
            });

            page++;
        } catch (error) {
            console.error(`Error fetching commits from ${repoName}:`, error.message);
            hasMoreCommits = false;
        }
    }
    return contributionData;
}

export async function collectGitHubData(username, token) {
    const contributionData = {};

    // Check if we have rate limit remaining before fetching data
    const remainingRequests = await checkRateLimit(token);
    if (remainingRequests <= 0) {
        throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
        // getting detail of every repo detail 
        const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, {
            headers: { Authorization: `token ${token}` }
        });

        for (const repo of reposResponse.data) {
            // finding the number of commit on the every date of the given parameters
            const repoContributionData = await fetchCommits(repo.name, username, token);
            for (const date in repoContributionData) {
                if (!contributionData[date]) {
                    contributionData[date] = 0;
                }
                contributionData[date] += repoContributionData[date];
            }
        }

        return contributionData;

    } catch (error) {
        console.error("Failed to collect GitHub data:", error.message);
        throw new Error('Error collecting GitHub data');
    }
}

export async function fetchAndStoreAllContributions(req, res) {
    try {
        await fetchAndStoreGitHubData();
        res.json({ message: 'GitHub contributions successfully updated.' });
    } catch (error) {
        console.error('Failed to fetch and store GitHub data:', error.message);
        res.status(500).json({ error: 'Something went wrong.' });
    }
}