import Link from "next/link";
import { auth } from "~/server/auth";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/appartments");

  return (
    <main className="grid min-h-[80dvh] place-items-center px-4">
      <div className="w-full max-w-3xl">
        <Card className="from-background to-muted/30 border-0 bg-gradient-to-br shadow-none">
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="bg-primary/10 size-9 rounded-xl" />
                <span className="text-muted-foreground text-sm tracking-wide uppercase">
                  T3 Stack Demo
                </span>
              </div>

              <h1 className="text-3xl leading-tight font-semibold md:text-5xl">
                Find a place. <span className="text-primary">Book it.</span>
              </h1>

              <p className="text-muted-foreground max-w-prose text-sm md:text-base">
                Tiny demo showing a real-world T3 setup: Next.js + tRPC + Prisma
                + NextAuth + shadcn/ui. Browse published apartments, view
                details, and book with real availability checks.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/api/auth/signin?callbackUrl=/appartments">
                    Sign in
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/signup?callbackUrl=/appartments">
                    Create account
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
