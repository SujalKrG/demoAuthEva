export const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
};


// import { createClient } from "redis";

// const client = createClient({
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//   },
//   password: process.env.REDIS_PASSWORD, // required if auth is enabled
// });

// client.on("error", (err) => console.error("Redis Client Error", err));

// await client.connect();

