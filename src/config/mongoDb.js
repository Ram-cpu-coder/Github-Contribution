import mongoose from 'mongoose';

export const connectDb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,  // ⬅️ wait up to 30 seconds for server selection
            socketTimeoutMS: 45000            // ⬅️ increase timeout for operations like updateOne
        })
        connection && console.log('✅ MongoDB connected');
    } catch (error) {
        console.log("Error while connecting to Database ", error);
        process.exit(1);
    }
}