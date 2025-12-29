import * as v from "valibot";

export const UsernameSchema = v.pipe(
  v.string(),
  v.minLength(3, "Username must be at least 3 characters"),
  v.maxLength(31, "Username must be at most 31 characters"),
  v.regex(
    /^[a-z0-9_-]+$/,
    "Username can only contain lowercase letters, numbers, hyphens, and underscores"
  )
);

export const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(6, "Password must be at least 6 characters"),
  v.maxLength(255, "Password must be at most 255 characters")
);

export const AuthFormSchema = v.object({
  username: UsernameSchema,
  password: PasswordSchema,
});

export type AuthFormData = v.InferOutput<typeof AuthFormSchema>;
