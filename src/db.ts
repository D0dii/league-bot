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
      username TEXT NOT NULL,
      tag TEXT NOT NULL,
      puuid TEXT UNIQUE,
      lastMatchId TEXT
    )
  `);
  return db;
}

export async function storeUser(username: string, puuid: string, tag: string, lastMatchId: string = "") {
  const db = await openDb();
  await db.run(
    `INSERT OR REPLACE INTO users (username, tag, puuid, lastMatchId) VALUES (?, ?, ?, ?)`,
    username,
    tag,
    puuid,
    lastMatchId
  );
}

export async function getUser(username: string, tag: string) {
  const db = await openDb();
  return db.get("SELECT * FROM users WHERE username = ? AND tag = ?", username, tag);
}

export async function updateUserLastMatchId(username: string, tag: string, lastMatchId: string) {
  const db = await openDb();
  await db.run("UPDATE users SET lastMatchId = ? WHERE username = ? AND tag = ?", lastMatchId, username, tag);
}
