import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const urlToDelete = searchParams.get("url");
  if (!urlToDelete)
    return NextResponse.json({ error: "Missing url" }, { status: 400 });

  await del(urlToDelete);
  return NextResponse.json({ ok: true });
}
