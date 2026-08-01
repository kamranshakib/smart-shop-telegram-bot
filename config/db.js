const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return { success: true, conn: mongoose.connection };
  }

  if (!process.env.MONGO_URI) {
    const error = new Error("MONGO_URI is not defined");
    console.warn("MongoDB connection skipped: MONGO_URI is not set.");
    return { success: false, error };
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,
    });

    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return { success: true, conn };
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return { success: false, error };
  }
};

module.exports = connectDB;
