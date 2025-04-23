import Contribution from "../schema/githubSchema.js"
export const fetchAllContributionFromDatabase = async (req, res) => {
    try {
        const response = await Contribution.find({})
        return res.status(200).json({
            status: "success",
            data: response
        })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Fetching failed from database"
        })
    }
}