import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function openDb() {
  return open({
    filename: "./league-bot.db",
    driver: sqlite3.Database,
  });
}

export async function setupDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      puuid TEXT UNIQUE,
      lastMatchId TEXT
    )
  `);
  return db;
}

export async function storeUser(username: string, puuid: string, lastMatchId: string) {
  const db = await openDb();
  await db.run(
    "INSERT OR REPLACE INTO users (username, puuid, lastMatchId) VALUES (?, ?, ?)",
    username,
    puuid,
    lastMatchId
  );
}

export async function getUser(username: string) {
  const db = await openDb();
  return db.get("SELECT * FROM users WHERE username = ?", username);
}

export async function updateUserLastMatchId(username: string, lastMatchId: string) {
  const db = await openDb();
  await db.run("UPDATE users SET lastMatchId = ? WHERE username = ?", lastMatchId, username);
}
