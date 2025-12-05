"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

const errorMessages: Record<string, string> = {
  OAuthSignin: "Could not start OAuth sign-in.",
  OAuthCallback: "OAuth callback failed.",
  OAuthAccountNotLinked: "Email already used with another sign-in method.",
  EmailCreateAccount: "Failed to create email login.",
  CallbackRouteError: "Sign-in callback failed.",
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to continue.",
};

export default function SignInForm() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/appartments";
  const err = sp.get("error");
  const defaultEmail = sp.get("email") ?? "";
  const [email, setEmail] = React.useState(defaultEmail);
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState<
    "discord" | "credentials" | null
  >(null);

  React.useEffect(() => {
    if (err) toast.error(errorMessages[err] ?? "Sign-in failed");
  }, [err]);

  const onCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("credentials");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl,
    });
    setLoading(null);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your account to continue.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setLoading("discord");
            void signIn("discord", { callbackUrl });
          }}
          disabled={loading === "discord"}
        >
          {/* replace with your icon component if you have one */}
          <span className="mr-2 inline-block">🎮</span>
          {loading === "discord" ? "Connecting…" : "Continue with Discord"}
        </Button>

        <div className="relative">
          <Separator />
          <span className="bg-card text-muted-foreground absolute inset-0 -top-3 mx-auto w-fit px-2 text-xs">
            or
          </span>
        </div>

        <form onSubmit={onCredentials} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              type="email"
              placeholder="you@example.com"
              disabled={loading !== null}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              type="password"
              placeholder="••••••••"
              disabled={loading !== null}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading !== null}>
            {loading === "credentials" ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs">
          Don’t have an account?{" "}
          <a
            className="hover:text-foreground underline underline-offset-4"
            href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          >
            Create one
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
