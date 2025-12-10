import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Please enter your name."),
    email: z.string().trim().toLowerCase().email("Enter a valid email."),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, "Use letters and numbers."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
