import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { AmbientBand } from "@/components/ornaments";
import { SignInPanel } from "@/components/SignInPanel";

export const metadata = { title: "Sign in — The Light House Project Library" };

export default function SignInPage() {
  return (
    <>
      <AmbientBand />
      <SiteHeader />
      <main className="auth">
        <Suspense>
          <SignInPanel />
        </Suspense>
      </main>
    </>
  );
}
