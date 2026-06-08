import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap() {
  await connectDatabase();
  app.listen(env.port, () => {
    console.log(`[server] API running on http://localhost:${env.port}/api/v1`);
  });
}

bootstrap().catch((error) => {
  console.error("[server] failed to start", error);
  process.exit(1);
});
