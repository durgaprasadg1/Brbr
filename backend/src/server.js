const app = require("./app");
const { connectRedis } = require("./common/redis/client");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();