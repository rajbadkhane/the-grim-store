import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap() {
  try {
    await connectDatabase();
  } catch (error) {
    console.warn("[server] Database connection failed on startup – server will start anyway.");
    console.warn("[server] API endpoints requiring DB will return errors until the database is reachable.");
  }
  app.listen(env.port, () => {
    console.log(`[server] API running on http://localhost:${env.port}/api/v1`);
  });
}

bootstrap().catch((error) => {
  console.error("[server] failed to start", error);
  process.exit(1);
});
