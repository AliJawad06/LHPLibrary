"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { BrandMark } from "./ornaments";

export function SiteHeader({ active }: { active?: "library" | "account" | "admin" }) {
  const me = useQuery(api.me.get);
  const router = useRouter();

  const signOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label="The Light House Project library home">
          <span className="brand__mark">
            <BrandMark />
          </span>
          <span className="brand__wordmark">
            <span className="brand__lockup">The Light House Project</span>
            <span className="brand__sub">Community Library · Triangle, NC</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <a href="https://www.lhproj.com" className="site-nav__link">Home</a>
          <a href="https://www.lhproj.com/events" className="site-nav__link">Events</a>
          <Link
            href="/"
            className={`site-nav__link${active === "library" ? " site-nav__link--active" : ""}`}
            aria-current={active === "library" ? "page" : undefined}
          >
            Library
          </Link>
          {me && (
            <Link
              href="/account"
              className={`site-nav__link${active === "account" ? " site-nav__link--active" : ""}`}
              aria-current={active === "account" ? "page" : undefined}
            >
              My shelf
            </Link>
          )}
          {me?.role === "admin" && (
            <Link
              href="/admin"
              className={`site-nav__link${active === "admin" ? " site-nav__link--active" : ""}`}
              aria-current={active === "admin" ? "page" : undefined}
            >
              Admin
            </Link>
          )}
          {me === null && (
            <Link href="/signin" className="site-nav__link site-nav__link--donate">
              Sign in
            </Link>
          )}
          {me && (
            <>
              <span className="site-nav__user" title={me.email}>
                {me.image ? (
                  <span className="site-nav__avatar">
                    {/* Plain img: Workers has no default Next image optimizer,
                        and a 26px avatar doesn't need one. */}
                    <img
                      src={me.image}
                      alt=""
                      width={26}
                      height={26}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </span>
                ) : null}
                {me.name || me.email}
              </span>
              <button type="button" className="site-nav__link" onClick={signOut}>
                Sign out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
