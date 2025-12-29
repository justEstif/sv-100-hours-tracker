import * as v from "valibot";
import { PasswordSchema } from "./auth";

export const ChangePasswordSchema = v.pipe(
  v.object({
    currentPassword: PasswordSchema,
    newPassword: PasswordSchema,
    confirmPassword: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [["newPassword"], ["confirmPassword"]],
      (input) => input.newPassword === input.confirmPassword,
      "Passwords do not match",
    ),
    ["confirmPassword"],
  ),
);

export type ChangePasswordData = v.InferOutput<typeof ChangePasswordSchema>;

export const DeleteAccountSchema = v.object({
  password: PasswordSchema,
  confirmation: v.pipe(
    v.string(),
    v.check((val) => val === "DELETE", "Type DELETE to confirm"),
  ),
});

export type DeleteAccountData = v.InferOutput<typeof DeleteAccountSchema>;
