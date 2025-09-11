import { createClient } from "redis";

const client = createClient({
  url: "redis://localhost:6379" // change if using remote Redis
});

client.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

client.on("connect", () => {
  console.log("✅ Redis client connected");
});

client.on("ready", async () => {
  console.log("🎉 Redis is ready to use!");

  // Test set/get
  await client.set("testKey", "Hello Redis!");
  const value = await client.get("testKey");
  console.log("Test value from Redis:", value);

  await client.quit();
});

await client.connect();
