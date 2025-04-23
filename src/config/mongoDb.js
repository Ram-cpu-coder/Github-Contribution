import mongoose from 'mongoose';

export const connectDb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL, {
            // wait up to 30 seconds for server selection
            serverSelectionTimeoutMS: 30000,
            // increase timeout for operations like updateOne
            socketTimeoutMS: 45000
        })
        connection && console.log('MongoDB connected');
    } catch (error) {
        console.log("Error while connecting to Database ", error);
        process.exit(1);
    }
}