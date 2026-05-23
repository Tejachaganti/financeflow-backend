import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

const connectMemoryDB = async () => {
  memoryServer = await MongoMemoryServer.create({
    instance: { dbName: "financeflow" }
  });

  const memoryUri = memoryServer.getUri();
  await mongoose.connect(memoryUri);
  console.log("MongoDB memory server connected");
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.warn(`MongoDB connection failed: ${error.message}`);
    console.log("Falling back to in-memory MongoDB for local development");
    await connectMemoryDB();
  }
};

const shutdown = async () => {
  if (memoryServer) {
    await mongoose.connection.close();
    await memoryServer.stop();
  }
};

process.on("SIGINT", async () => {
  await shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await shutdown();
  process.exit(0);
});

export default connectDB;
