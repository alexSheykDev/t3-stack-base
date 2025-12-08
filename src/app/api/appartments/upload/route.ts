import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "~/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only images are allowed" },
      { status: 400 },
    );
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Max 4MB" }, { status: 400 });
  }

  const keySafeName = file.name.replace(/\s+/g, "-");
  const objectKey = `apartments/${crypto.randomUUID()}-${keySafeName}`;

  const blob = await put(objectKey, file, { access: "public" });

  return NextResponse.json({ url: blob.url }, { status: 201 });
}
