"use server";

import bcrypt from "bcrypt";
import { db } from "~/server/db";
import { signUpSchema } from "~/validations/auth";
import { redirect } from "next/navigation";
import { signIn } from "~/server/auth";

export async function registerAndLogin(form: unknown) {
  const parsed = signUpSchema.safeParse(form);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key])
        fieldErrors[key] = issue.message;
    }
    return { ok: false as const, fieldErrors };
  }

  const { email, name, password } = parsed.data;

  const exists = await db.user.findUnique({ where: { email } });
  if (exists) {
    return {
      ok: false as const,
      fieldErrors: { email: "Email already in use" },
    };
  }

  const hash = await bcrypt.hash(password, 12);
  await db.user.create({
    data: { email, name, role: "USER", passwordHash: hash },
  });

  await signIn("credentials", { email, password, redirectTo: "/appartments" });

  redirect("/appartments");
}
