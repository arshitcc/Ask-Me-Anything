import mongoose from "mongoose";

type Connection = {
    isConnected?: number;
    host? : string;
};

const connection : Connection = {};

export const connectDB = async () : Promise<void> => {
    try {
        if(connection.isConnected) {
            console.log("DB Already Connected");
            return;
        }
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
        connection.isConnected = connectionInstance.connections[0].readyState;
        connection.host = connectionInstance.connection.host;
        console.log(`DB Connected Successfully`);
    } catch (error) {
        console.log('DB Connection Failed',error);
        process.exit(1);
    }
};