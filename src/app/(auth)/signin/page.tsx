import { Suspense } from "react";
import SignInForm from "~/_components/modules/auth/SignInForm";

export default function Page() {
  return (
    <div className="grid min-h-[80dvh] place-items-center px-4">
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
