import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "../../schema.sql");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing in .env");
    process.exit(1);
  }

  const sql = fs.readFileSync(schemaPath, "utf8");
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

  await client.connect();
  console.log("Connected to PostgreSQL");

  try {
    await client.query(sql);
    console.log("Applied schema.sql (tables, constraints, indexes, seed)");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
