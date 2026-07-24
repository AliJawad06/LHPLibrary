"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

const LHP_NAV = [
  { label: "HOME", href: "https://www.lhproj.com" },
  {
    label: "Our Story",
    href: "https://www.lhproj.com/our-story",
    children: [
      { label: "Incubators", href: "https://www.lhproj.com/incubators" },
      { label: "Annual Report 2025", href: "https://www.lhproj.com/about-5" },
    ],
  },
  {
    label: "Events",
    href: "https://www.lhproj.com/events",
    children: [
      { label: "Ramadan 2026", href: "https://www.lhproj.com/ramadan-2026" },
    ],
  },
  { label: "The Team", href: "https://www.lhproj.com/the-team" },
  {
    label: "Donate",
    href: "https://www.lhproj.com/donate",
    children: [
      { label: "LHP Legacy Circle", href: "https://www.lhproj.com/legacycircle" },
    ],
  },
  {
    label: "Stay in Touch",
    href: "https://www.lhproj.com/stay-in-touch",
    children: [
      { label: "Subscribe", href: "https://www.lhproj.com/contact-8" },
    ],
  },
] as const;

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

        {/* Brand — logo + org name + tagline */}
        <Link href="/" className="brand" aria-label="The Light House Project library home">
          <img
            src="https://static.wixstatic.com/media/c2af7e_adce290c1e234d24b2e4a8f68f7c2478~mv2.jpeg/v1/fill/w_146,h_146,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Copy%20of%20Logo.jpeg"
            alt=""
            width={48}
            height={48}
            className="brand__logo"
          />
          <span className="brand__wordmark">
            <span className="brand__lockup">The Light House Project</span>
            <span className="brand__sub">Empowering Muslim Americans in the Triangle</span>
          </span>
        </Link>

        {/* lhproj.com site navigation with dropdowns */}
        <nav className="lhp-nav" aria-label="LHP site">
          <ul className="lhp-nav__list">
            {LHP_NAV.map((item) => (
              <li key={item.label} className="lhp-nav__item">
                <a href={item.href} className="lhp-nav__link">
                  {item.label}
                  {"children" in item && (
                    <svg className="lhp-nav__chevron" viewBox="0 0 16 11" aria-hidden="true">
                      <path d="M8 10.5L16 1.86193L14.7387 0.5L8 7.77613L1.26133 0.499999L0 1.86193L8 10.5Z" fill="currentColor" />
                    </svg>
                  )}
                </a>
                {"children" in item && (
                  <ul className="lhp-nav__dropdown">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <a href={child.href} className="lhp-nav__dropdown-link">{child.label}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Library app links + auth */}
        <nav className="site-nav" aria-label="Library">
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
            <Link href="/signin" className="site-nav__link site-nav__link--cta">
              Sign in
            </Link>
          )}
          {me && (
            <>
              <span className="site-nav__user" title={me.email}>
                {me.image && (
                  <span className="site-nav__avatar">
                    <img
                      src={me.image}
                      alt=""
                      width={26}
                      height={26}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </span>
                )}
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
