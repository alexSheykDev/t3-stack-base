import SignInForm from "~/_components/modules/auth/SignInForm";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="grid min-h-[80dvh] place-items-center px-4">
      <SignInForm />
    </div>
  );
}
