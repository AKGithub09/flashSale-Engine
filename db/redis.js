import Redis from "ioredis";
import { REDIS_URI } from "../config/envConfig.js";

const redis = new Redis(REDIS_URI);

redis.on("connect", () => {
  console.log("Redis database is connected");
});

redis.on("error", () => {
  console.log("Redis database is not connected");
});

export default redis;