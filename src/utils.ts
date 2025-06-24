import fs from "fs/promises";
import z from "zod";
import { FileValidateResult, userSchema } from "./types";

export const getUserPuuid = async (username: string, tag: string, token: string) => {
  const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    username
  )}/${encodeURIComponent(tag)}`;
  const res = await fetch(url, { headers: { "X-Riot-Token": token ?? "" } });
  if (!res.ok) throw new Error("Nie znaleziono gracza");
  const data = await res.json();
  return data.puuid;
};

export const validateJsonFile = async (filePath: string): Promise<FileValidateResult> => {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);

    const result = z.array(userSchema).parse(parsed);
    return { status: "success", result };
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error("❌ Validation errors:", err.errors);
      return { status: "failed", message: "zod error" };
    } else {
      return { status: "failed", message: "file error" };
    }
  }
};
