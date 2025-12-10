"use client";

import * as React from "react";
import { toast } from "sonner";
import { signUpSchema, type SignUpInput } from "~/validations/auth";
import { registerAndLogin } from "~/actions/auth/registerAndLoginAction";

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
import Link from "next/link";

type Errors = Partial<Record<keyof SignUpInput, string>>;

export default function SignUpForm() {
  const [values, setValues] = React.useState<SignUpInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const callbackUrl = "/appartments";

  const validate = (v: SignUpInput) => {
    const parsed = signUpSchema.safeParse(v);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: Errors = {};
    for (const i of parsed.error.issues) {
      const k = i.path[0] as keyof SignUpInput;
      if (typeof k === "string") fieldErrors[k] ??= i.message;
    }
    setErrors(fieldErrors);
    return false;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate(values)) return;
    try {
      setSubmitting(true);

      const res = await registerAndLogin({
        ...values,
        email: values.email.trim().toLowerCase(),
        name: values.name.trim(),
      });

      if (res && !res.ok && res.fieldErrors) {
        setErrors(res.fieldErrors as Errors);
        toast.error("Please fix the errors and try again.");
      }
    } catch {
      toast.error("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Sign up to start booking apartments.</CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={values.name}
              onChange={(e) => {
                const v = e.currentTarget.value;
                setValues((s) => ({ ...s, name: v }));
              }}
              placeholder="Jane Doe"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              disabled={submitting}
            />
            {errors.name && (
              <p id="name-error" className="text-destructive text-xs">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => {
                const v = e.currentTarget.value;
                setValues((s) => ({ ...s, email: v }));
              }}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={submitting}
              inputMode="email"
              autoComplete="email"
            />
            {errors.email && (
              <p id="email-error" className="text-destructive text-xs">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={values.password}
              onChange={(e) => {
                const v = e.currentTarget.value;
                setValues((s) => ({ ...s, password: v }));
              }}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              disabled={submitting}
              autoComplete="new-password"
            />
            {errors.password && (
              <p id="password-error" className="text-destructive text-xs">
                {errors.password}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              At least 6 chars, letters + numbers.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={(e) => {
                const v = e.currentTarget.value;
                setValues((s) => ({ ...s, confirmPassword: v }));
              }}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
              disabled={submitting}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="text-destructive text-xs"
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating..." : "Create account"}
          </Button>

          <p className="text-muted-foreground text-xs">
            Already have an account?{" "}
            <Link
              href={`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="hover:text-foreground underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
