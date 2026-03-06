// lib/db/connection.ts
import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const globalCache = global._mongooseCache || { conn: null, promise: null };

if (!global._mongooseCache) {
  global._mongooseCache = globalCache;
}

/** Whether we've already attached mongoose connection listeners */
let listenersAttached = false;

/**
 * Attach one-time connection event listeners for debugging and monitoring.
 */
function attachConnectionListeners(): void {
  if (listenersAttached) return;
  listenersAttached = true;

  const conn = mongoose.connection;
  conn.on("connected", () => {
    console.log("[MongoDB] Connected successfully");
  });
  conn.on("error", (err) => {
    console.error("[MongoDB] Connection error:", err.message);
  });
  conn.on("disconnected", () => {
    console.warn("[MongoDB] Disconnected");
  });
}

export async function connectDB(): Promise<Mongoose> {
  if (globalCache.conn) return globalCache.conn;

  attachConnectionListeners();

  if (!globalCache.promise) {
    const isProduction = process.env.NODE_ENV === "production";

    globalCache.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: isProduction ? 10 : 5,
        autoIndex: !isProduction, // disable auto-index in production for performance
      })
      .then((m) => m)
      .catch((err) => {
        globalCache.promise = null;
        throw err;
      });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
