import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db } from "~/server/db";

export const RegisterInput = z.object({
  email: z.string(),
  password: z.string().min(6),
  name: z.string().min(1).optional(),
});
export type RegisterInput = z.infer<typeof RegisterInput>;

export async function POST(req: Request) {
  try {
    const { email, password, name } = RegisterInput.parse(
      (await req.json()) as unknown,
    );

    const exists = await db.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.user.create({
      data: { email, name, role: "USER", passwordHash },
    });

    return NextResponse.json({ ok: true as const }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
