import z from "zod";

export const userSchema = z.object({
  username: z.string(),
  tag: z.string(),
  game: z.enum(["lol"]),
});

export type User = z.infer<typeof userSchema>;

export type FileValidateResult =
  | {
      status: "success";
      result: User[];
    }
  | { status: "failed"; message: string };
