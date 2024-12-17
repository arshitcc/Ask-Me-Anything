import { z } from "zod";

export const usernameSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9_]{3,16}$/,
    "Username must be 3-16 characters long and can only contain letters, numbers, and underscores."
  );

export const signupSchema = z.object({
  username: usernameSchema,
  email: z
    .string()
    .email()
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address."
    ),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
});
