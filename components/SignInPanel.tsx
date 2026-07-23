"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignInPanel() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const google = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await authClient.signIn.social({
      provider: "google",
      callbackURL: redirect,
    });
    if (err) {
      setError(err.message ?? "Google sign-in didn't complete. Please try again.");
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result =
      mode === "signin"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name });
    if (result.error) {
      setError(
        result.error.message ??
          (mode === "signin"
            ? "That email and password don't match our records."
            : "We couldn't create that account. Try a different email."),
      );
      setBusy(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="auth__panel">
      <div>
        <h1 className="auth__title">
          {mode === "signin" ? "Welcome back." : "Join the library."}
        </h1>
        <p className="auth__sub">
          {mode === "signin"
            ? "Sign in to borrow books, track due dates, and hold titles."
            : "A free account for borrowing from the community bookshelf."}
        </p>
      </div>

      <button type="button" className="btn btn--google btn--full" onClick={google} disabled={busy}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.8-2.1 5.1-4.4 6.7v5.5h7.1c4.2-3.9 6.6-9.6 6.6-16.2z" />
          <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.2H4.3v5.7C7.9 40.9 15.4 46 24 46z" />
          <path fill="#FBBC05" d="M11.6 28.1c-.5-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1v-5.7H4.3C2.8 17.1 2 20.4 2 24s.8 6.9 2.3 9.8l7.3-5.7z" />
          <path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 4.3 30 2 24 2 15.4 2 7.9 7.1 4.3 14.2l7.3 5.7c1.7-5.3 6.6-9.1 12.4-9.1z" />
        </svg>
        Continue with Google
      </button>

      <div className="auth__divider">or with email</div>

      <form className="auth__form" onSubmit={submit}>
        {mode === "signup" && (
          <div className="field">
            <label className="field__label" htmlFor="auth-name">Name</label>
            <input
              id="auth-name"
              className="field__input"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}
        <div className="field">
          <label className="field__label" htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            className="field__input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            className="field__input"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="auth__error" role="alert">{error}</p>}

        <button type="submit" className="btn btn--primary btn--full" disabled={busy}>
          {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="auth__switch">
        {mode === "signin" ? (
          <>
            New to the library?{" "}
            <button type="button" onClick={() => { setMode("signup"); setError(null); }}>
              Create an account
            </button>
          </>
        ) : (
          <>
            Already a member?{" "}
            <button type="button" onClick={() => { setMode("signin"); setError(null); }}>
              Sign in instead
            </button>
          </>
        )}
      </p>
    </div>
  );
}
