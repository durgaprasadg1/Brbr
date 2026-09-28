const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  console.log("✅ Redis connected");
}

module.exports = {
  redisClient,
  connectRedis,
};