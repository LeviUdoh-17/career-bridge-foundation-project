"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";

const TEAL = "#4DC5D2";
const NAVY = "#003359";
const BORDER = "#D5DCE8";
const LIGHT_GREY = "#F3F3F3";

// ── Discipline data ──────────────────────────────────────
const disciplines = [
  {
    id: 1,
    name: "Product Management",
    description:
      "Prove your product thinking across strategy, discovery, and delivery through simulations verified by experienced product managers and industry practitioners.",
    status: "available",
    count: "Foundation to Advanced",
    href: "/simulations/product-management",
  },
  {
    id: 2,
    name: "Project Management",
    description:
      "Stand out from the crowd with verified evidence of your project management capability. Real scenarios, real skills, real proof that goes beyond your CV.",
    status: "available",
    count: "Foundation to Advanced",
    href: "/simulations/project-management",
  },
  {
    id: 3,
    name: "Cyber Security",
    description:
      "Simulations aligned to the UK Cyber Security Council Career Framework and verified by expert consultants. Build credible evidence for roles across the cyber security sector.",
    status: "available",
    count: "Foundation to Advanced",
    href: "/simulations/cyber-security",
  },
  {
    id: 4,
    name: "Cloud DevOps",
    description:
      "Build hands-on capability in cloud infrastructure, deployment pipelines, and DevOps practices through realistic workplace simulations.",
    status: "coming-soon",
  },
  {
    id: 5,
    name: "Customer Service",
    description:
      "Develop the customer facing capabilities organisations are actively hiring for. Go beyond knowledge and demonstrate the skills that make you the candidate they want.",
    status: "available",
    count: "Foundation to Advanced",
    href: "/simulations/customer-service",
  },
  {
    id: 6,
    name: "Healthcare Assistance",
    description:
      "Develop practical healthcare support skills through scenario based simulations aligned to real workplace expectations in the healthcare sector.",
    status: "coming-soon",
  },
  {
    id: 7,
    name: "Data Analytics",
    description:
      "Demonstrate your ability to analyse data, generate insights, and communicate findings through realistic business scenarios.",
    status: "coming-soon",
  },
  {
    id: 8,
    name: "SEO Analysis",
    description:
      "Build and prove your digital marketing and SEO capability through practical simulations aligned to what employers are looking for.",
    status: "coming-soon",
  },
  {
    id: 9,
    name: "Business Analysis",
    description:
      "Prove your ability to gather requirements, map processes, and communicate analysis through structured workplace simulations.",
    status: "coming-soon",
  },
];

export default function SimulationsPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen">

      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          backgroundColor: scrolled ? "#ffffff" : "transparent",
          borderBottom: scrolled ? `1px solid ${BORDER}` : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between relative">
          <img
            src="/logo-colour.png"
            alt="Career Bridge Foundation"
            style={{ height: "40px", width: "auto" }}
          />
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {["Simulations", "For Coaches", "About", "Blog"].map((link) => (
              <a
                key={link}
                href={`/${link.toLowerCase().replace(/ /g, "-")}`}
                className="text-xs font-medium uppercase transition-opacity hover:opacity-60"
                style={{
                  color: scrolled ? NAVY : "#ffffff",
                  letterSpacing: "0.12em",
                  transition: "color 0.2s, opacity 0.15s",
                }}
              >
                {link}
              </a>
            ))}
          </nav>
          <a
            href="#"
            className={
              scrolled
                ? "btn-apply text-xs font-medium uppercase px-5 py-2.5"
                : "btn-apply-inverted text-xs font-medium uppercase px-5 py-2.5"
            }
            style={{ letterSpacing: "0.12em" }}
          >
            Apply
          </a>
        </div>
      </header>

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <section
        className="relative px-6 pt-40 pb-24"
        style={{ backgroundColor: NAVY }}
      >
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span
              className="text-xs font-medium uppercase"
              style={{ color: TEAL, letterSpacing: "0.18em" }}
            >
              Career Bridge Portfolio Simulations
            </span>
          </div>
          <h1
            className="font-bold text-white mb-5"
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", lineHeight: 1.15 }}
          >
            Choose Your Discipline
          </h1>
          <p
            className="text-base font-light md:whitespace-nowrap"
            style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.75 }}
          >
            Select a discipline, browse real industry simulations, and build verified portfolio evidence for employers.
          </p>
        </div>
      </section>

      {/* ── DISCIPLINES GRID ────────────────────────────────── */}
      <section className="px-6 py-20" style={{ backgroundColor: LIGHT_GREY }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-2xl font-bold mb-12"
            style={{ color: NAVY }}
          >
            Prove Your Capabilities by Job Role
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: BORDER }}>
            {disciplines.map((d) => (
              <div
                key={d.id}
                className="discipline-card bg-white p-8 flex flex-col"
                style={{ transition: "border-color 0.15s" }}
              >
                {/* Status badge */}
                <div className="mb-5">
                  {d.status === "available" ? (
                    <span
                      className="text-xs font-semibold uppercase px-3 py-1.5"
                      style={{
                        color: TEAL,
                        border: `1px solid ${TEAL}`,
                        letterSpacing: "0.14em",
                      }}
                    >
                      Available Now
                    </span>
                  ) : (
                    <span
                      className="text-xs font-semibold uppercase px-3 py-1.5"
                      style={{
                        color: "#aaa",
                        border: "1px solid #ccc",
                        letterSpacing: "0.14em",
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </div>

                {/* Name + description */}
                <h3
                  className="text-lg font-bold mb-3"
                  style={{ color: NAVY, lineHeight: 1.3 }}
                >
                  {d.name}
                </h3>
                <p
                  className="text-sm flex-1"
                  style={{ color: "#555", lineHeight: 1.75 }}
                >
                  {d.description}
                </p>

                {/* Divider + bottom row */}
                <div
                  className="mt-7 pt-5 flex items-center justify-between"
                  style={{ borderTop: `1px solid ${BORDER}` }}
                >
                  {d.status === "available" ? (
                    <>
                      <span className="text-sm" style={{ color: "#999" }}>
                        {d.count}
                      </span>
                      <a
                        href={d.href}
                        className="text-sm font-medium"
                        style={{ color: TEAL }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLElement).style.textDecoration = "underline")
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLElement).style.textDecoration = "none")
                        }
                      >
                        Start Practicing →
                      </a>
                    </>
                  ) : (
                    <>
                      <span className="text-sm" style={{ color: "#ccc" }}>
                        Coming Soon
                      </span>
                      <span
                        className="text-sm font-medium"
                        style={{ color: TEAL }}
                      >
                        Join The Waitlist →
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DON'T SEE YOUR DISCIPLINE ───────────────────────── */}
      <section
        className="py-24 px-6 text-center"
        style={{ backgroundColor: NAVY }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
          <h2
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ lineHeight: 1.2 }}
          >
            Don&apos;t see your discipline?
          </h2>
          <p
            className="text-base font-light"
            style={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.8 }}
          >
            We are constantly expanding our simulation library. Get notified
            when new disciplines launch.
          </p>
          <a
            href="#"
            className="btn-apply-inverted text-xs font-medium uppercase px-7 py-3.5 mt-2"
            style={{ letterSpacing: "0.12em" }}
          >
            Join the Waitlist
          </a>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ backgroundColor: NAVY }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">

            {/* Col 1: Brand */}
            <div className="flex flex-col gap-4">
              <img
                src="/logo-white.png"
                alt="Career Bridge Foundation"
                style={{ height: "48px", width: "auto", objectFit: "contain" }}
              />
            </div>

            {/* Col 2: Navigation */}
            <div>
              <p
                className="text-xs font-semibold uppercase mb-6"
                style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em" }}
              >
                Navigation
              </p>
              <div className="flex flex-col gap-3.5">
                {["Home", "How It Works", "Simulations", "For Coaches", "Contact"].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="footer-link text-sm"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 3: Policies */}
            <div>
              <p
                className="text-xs font-semibold uppercase mb-6"
                style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em" }}
              >
                Policies
              </p>
              <div className="flex flex-col gap-3.5">
                {[
                  "Privacy Policy",
                  "Terms of Use",
                  "Safeguarding Policy",
                  "Data Protection",
                  "Complaints Procedure",
                  "Other Policies",
                ].map((link) => (
                  <a
                    key={link}
                    href="#"
                    className="footer-link text-sm"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 4: Contact + Social */}
            <div>
              <p
                className="text-xs font-semibold uppercase mb-6"
                style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.14em" }}
              >
                Contact
              </p>
              <p className="text-xs italic mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                General Enquiries
              </p>
              <a
                href="mailto:support@careerbridgefoundation.zohodesk.eu"
                className="footer-link text-xs"
                style={{ color: TEAL, whiteSpace: "nowrap" }}
              >
                support@careerbridgefoundation.zohodesk.eu
              </a>
              <p className="text-xs italic mt-5 mb-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                Partnership Enquiries
              </p>
              <a
                href="mailto:outreach@careerbridgefoundation.com"
                className="footer-link text-xs"
                style={{ color: TEAL }}
              >
                outreach@careerbridgefoundation.com
              </a>
              <p className="text-xs mt-7 mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                Follow Us
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/careerbridgefoundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                  className="footer-link w-9 h-9 flex items-center justify-center"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/careerbridgefoundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  className="footer-link w-9 h-9 flex items-center justify-center"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/careerbridgefoundation"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook"
                  className="footer-link w-9 h-9 flex items-center justify-center"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            &copy; 2026 Career Bridge Foundation CIC. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Registered Company Number: 16939467
          </p>
        </div>
      </footer>

    </div>
  );
}
