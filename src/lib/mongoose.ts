import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/cinestream";

declare global {
  var mongooseConn: typeof mongoose | null;
}

let cached = global.mongooseConn;

export async function connectDB() {
  if (cached) return cached;

  if (mongoose.connection.readyState === 1) {
    cached = mongoose;
    global.mongooseConn = cached;
    return cached;
  }

  await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  cached = mongoose;
  global.mongooseConn = cached;
  return cached;
}

export default connectDB;
