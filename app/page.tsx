"use client";

import { useState, useEffect } from "react";

const TEAL = "#4DC5D2";
const NAVY = "#003359";
const BORDER = "#D5DCE8";
const LIGHT_GREY = "#F3F3F3";

export default function Home() {
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
          {/* Logo */}
          <img
            src="/logo-colour.png"
            alt="Career Bridge Foundation"
            style={{ height: "40px", width: "auto" }}
          />

          {/* Centre nav links */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {["Simulations", "For Coaches", "About", "Blog"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/ /g, "-")}`}
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

          {/* Apply button */}
          <a
            href="#simulations"
            className={scrolled ? "btn-apply text-xs font-medium uppercase px-5 py-2.5" : "btn-apply-inverted text-xs font-medium uppercase px-5 py-2.5"}
            style={{ letterSpacing: "0.12em" }}
          >
            Apply
          </a>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center px-6"
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

        <div className="relative max-w-6xl mx-auto w-full pt-24 pb-20">
          {/* Teal line + label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span
              className="text-xs font-medium uppercase"
              style={{ color: TEAL, letterSpacing: "0.18em" }}
            >
              Portfolio Simulations
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-bold"
            style={{ lineHeight: 1.15 }}
          >
            <span
              className="block"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#ffffff", whiteSpace: "nowrap" }}
            >
              Prove what you can do.
            </span>
            <span
              className="block"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: TEAL, whiteSpace: "nowrap" }}
            >
              Not just what you know.
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="mt-7 text-base md:text-lg font-light"
            style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.75, maxWidth: "700px" }}
          >
            Complete realistic workplace simulations, receive AI-evaluated
            feedback, and build a portfolio of evidence that employers
            actually trust.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <a
              href="#simulations"
              className="btn-hero-primary inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium uppercase"
              style={{ letterSpacing: "0.1em" }}
            >
              Start a Simulation
            </a>
            <a
              href="#how-it-works"
              className="btn-hero-secondary inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium uppercase"
              style={{ letterSpacing: "0.1em" }}
            >
              See how it works
            </a>
          </div>

          {/* Trust signals */}
          <div className="mt-14 flex flex-col sm:flex-row gap-6 sm:gap-12">
            {[
              "AI-evaluated feedback",
              "Shareable portfolio output",
            ].map((item) => (
              <span
                key={item}
                className="text-xs font-medium uppercase"
                style={{ color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em" }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>


      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span
              className="text-xs font-medium uppercase"
              style={{ color: TEAL, letterSpacing: "0.18em" }}
            >
              The Process
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-16"
            style={{ color: NAVY, lineHeight: 1.2 }}
          >
            How it works
          </h2>

          {/* Cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-px"
            style={{ backgroundColor: BORDER }}
          >
            {[
              {
                num: "01",
                title: "Enter your simulation",
                desc: "You land inside a realistic workplace scenario at a simulated organisation built around your chosen discipline. Watch the project briefing from a senior colleague, understand the scenario context, and the task or expected deliverable you have been given.",
              },
              {
                num: "02",
                title: "Do the work",
                desc: "Complete your tasks as you would working within your simulated organisation. Provide your completed work as written responses, upload documents, or share deliverables from your preferred tools. You demonstrate your thinking, mindset and approach, not just answers.",
              },
              {
                num: "03",
                title: "Prove Your Work Experience",
                desc: "Receive a detailed evaluation breakdown and feedback on your completed simulation tasks. You will obtain shareable evidence for your digital portfolio and a verifiable digital credential that employers can trust.",
              },
            ].map(({ num, title, desc }) => (
              <div
                key={num}
                className="relative bg-white p-10 flex flex-col"
              >
                {/* Teal dot accent */}
                <div
                  className="absolute top-8 right-8 w-2 h-2 rounded-full"
                  style={{ backgroundColor: TEAL }}
                />

                {/* Number */}
                <span
                  className="text-xs font-semibold uppercase mb-7"
                  style={{ color: TEAL, letterSpacing: "0.18em" }}
                >
                  {num}
                </span>

                <h3
                  className="text-base font-bold mb-4"
                  style={{ color: NAVY, lineHeight: 1.4 }}
                >
                  {title}
                </h3>

                <p
                  className="text-sm flex-1"
                  style={{ color: "#666", lineHeight: 1.75 }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIMULATIONS ─────────────────────────────────────── */}
      <section
        id="simulations"
        className="py-28 px-6"
        style={{ backgroundColor: LIGHT_GREY }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span
              className="text-xs font-medium uppercase"
              style={{ color: TEAL, letterSpacing: "0.18em" }}
            >
              Career Simulation Disciplines
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-16"
            style={{ color: NAVY, lineHeight: 1.2 }}
          >
            Prove Your Capability
          </h2>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-px"
            style={{ backgroundColor: BORDER }}
          >
            {/* Product Management — Available */}
            <div className="relative bg-white p-10 flex flex-col">
              <div
                className="absolute top-8 right-8 w-2 h-2 rounded-full"
                style={{ backgroundColor: TEAL }}
              />
              <span
                className="text-xs font-semibold uppercase mb-1"
                style={{ color: TEAL, letterSpacing: "0.18em" }}
              >
                Available now
              </span>
              <span
                className="text-xs font-semibold uppercase mb-7"
                style={{ color: NAVY, letterSpacing: "0.18em" }}
              >
                01
              </span>
              <h3 className="text-base font-bold mb-4" style={{ color: NAVY, lineHeight: 1.4 }}>
                Product Management
              </h3>
              <p className="text-sm flex-1" style={{ color: "#666", lineHeight: 1.75 }}>
                Navigate real product decisions, define strategy, and demonstrate
                commercial thinking across a realistic business scenario.
              </p>
              <a
                href="#"
                className="arrow-link mt-8 text-sm font-medium inline-flex items-center gap-1"
                style={{ color: TEAL }}
              >
                Start simulation →
              </a>
            </div>

            {/* Project Management — Coming Soon */}
            <div className="relative bg-white p-10 flex flex-col">
              <div
                className="absolute top-8 right-8 w-2 h-2 rounded-full"
                style={{ backgroundColor: BORDER }}
              />
              <span
                className="text-xs font-semibold uppercase mb-1"
                style={{ color: "#aaa", letterSpacing: "0.18em" }}
              >
                Coming soon
              </span>
              <span
                className="text-xs font-semibold uppercase mb-7"
                style={{ color: NAVY, letterSpacing: "0.18em" }}
              >
                02
              </span>
              <h3 className="text-base font-bold mb-4" style={{ color: NAVY, lineHeight: 1.4 }}>
                Project Management
              </h3>
              <p className="text-sm flex-1" style={{ color: "#666", lineHeight: 1.75 }}>
                Lead a project through ambiguity, manage stakeholders, and
                demonstrate delivery capability in a structured workplace scenario.
              </p>
              <a
                href="#"
                className="arrow-link mt-8 text-sm font-medium inline-flex items-center gap-1"
                style={{ color: "#aaa" }}
              >
                Join waitlist →
              </a>
            </div>

            {/* Cyber Security — Coming Soon */}
            <div className="relative bg-white p-10 flex flex-col">
              <div
                className="absolute top-8 right-8 w-2 h-2 rounded-full"
                style={{ backgroundColor: BORDER }}
              />
              <span
                className="text-xs font-semibold uppercase mb-1"
                style={{ color: "#aaa", letterSpacing: "0.18em" }}
              >
                Coming soon
              </span>
              <span
                className="text-xs font-semibold uppercase mb-7"
                style={{ color: NAVY, letterSpacing: "0.18em" }}
              >
                03
              </span>
              <h3 className="text-base font-bold mb-4" style={{ color: NAVY, lineHeight: 1.4 }}>
                Cyber Security
              </h3>
              <p className="text-sm flex-1" style={{ color: "#666", lineHeight: 1.75 }}>
                Assess risk, respond to incidents, and demonstrate security
                judgement aligned to UK industry frameworks.
              </p>
              <a
                href="#"
                className="arrow-link mt-8 text-sm font-medium inline-flex items-center gap-1"
                style={{ color: "#aaa" }}
              >
                Join waitlist →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="bg-white py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span
              className="text-xs font-medium uppercase"
              style={{ color: TEAL, letterSpacing: "0.18em" }}
            >
              Candidate Stories
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold mb-16"
            style={{ color: NAVY, lineHeight: 1.2 }}
          >
            What candidates say
          </h2>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-px"
            style={{ backgroundColor: BORDER }}
          >
            {[
              {
                quote:
                  "Career Bridge has been a turning point in my career. The simulated work gave me the opportunity to apply agile principles in real projects, sharpen my coaching and facilitation skills, and accelerate my development in a way traditional learning never could.",
                name: "Henry A.",
                role: "Scrum Master",
              },
              {
                quote:
                  "The simulated work experience had a real impact on my skills. I improved my time management, built my communication confidence, and worked across more formats and platforms than I ever had before. It changed how I show up professionally.",
                name: "Olena A.",
                role: "Product Interaction Designer",
              },
              {
                quote:
                  "From day one I was trusted with real responsibilities. The hands-on experience I gained is something I would not trade for anything. It built my confidence, pushed me out of my comfort zone, and gave me practical skills no textbook could have taught me.",
                name: "Sanyu S.",
                role: "HR and Performance Analyst",
              },
            ].map(({ quote, name, role }) => (
              <div key={name} className="bg-white p-10">
                <span
                  className="block font-serif leading-none mb-6"
                  style={{ color: TEAL, fontSize: "4.5rem", lineHeight: 1 }}
                >
                  &ldquo;
                </span>
                <p
                  className="text-base"
                  style={{ color: "#444", lineHeight: 1.8 }}
                >
                  {quote}
                </p>
                <div
                  className="mt-8 pt-8"
                  style={{ borderTop: `1px solid ${BORDER}` }}
                >
                  <span
                    className="block font-bold text-sm"
                    style={{ color: NAVY }}
                  >
                    {name}
                  </span>
                  <span
                    className="block text-xs uppercase mt-1"
                    style={{ color: "#aaa", letterSpacing: "0.12em" }}
                  >
                    {role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR PARTNERS ────────────────────────────────────── */}
      <section
        className="py-28 px-6 text-center"
        style={{ backgroundColor: NAVY }}
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-7">
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-px" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
            <span
              className="text-xs font-medium uppercase"
              style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em" }}
            >
              Our Partners
            </span>
            <div className="w-8 h-px" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
          </div>

          <h2
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ lineHeight: 1.2 }}
          >
            Trusted by Academic and Professional Training Institutions
          </h2>

          <p
            className="text-base font-light max-w-lg"
            style={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.8 }}
          >
            Career Bridge Foundation works with leading academic institutions
            and professional training organisations to deliver portfolio
            simulations that help candidates demonstrate real-world capability
            and stand out in competitive job markets.
          </p>

          <span
            className="text-xs font-medium uppercase px-6 py-3"
            style={{
              border: "1px solid rgba(255,255,255,0.45)",
              color: "#ffffff",
              letterSpacing: "0.12em",
            }}
          >
            Academic &amp; Professional Training Institutions
          </span>
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

              <p
                className="text-xs mt-7 mb-4"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                Follow Us
              </p>
              <div className="flex gap-3">
                {/* Instagram */}
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
                {/* LinkedIn */}
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
                {/* Facebook */}
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
