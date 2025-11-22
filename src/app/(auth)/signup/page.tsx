import SignUpForm from "~/_components/modules/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-semibold">Create account</h1>
      <SignUpForm />
    </main>
  );
}
