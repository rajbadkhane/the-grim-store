import type { SqlUser } from "../lib/sql.js";

declare global {
  namespace Express {
    interface Request {
      user?: SqlUser;
    }
  }
}
