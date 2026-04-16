"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const TEAL = "#4DC5D2";
const NAVY = "#003359";
const BORDER = "#D5DCE8";
const LIGHT_GREY = "#F3F3F3";

// ── Simulation data ──────────────────────────────────────────────

const SIM = {
  title: "Product Strategy",
  company: "Nexus Bank",
  industry: "Financial Services",
  role: "Associate Product Manager",
};

const BRIEF_SHORT =
  "You are an Associate Product Manager at Nexus Bank. The business is launching a new startup-focused bank account and you have been brought in to define the product direction. You have two weeks before your first executive presentation.";

const BRIEF_FULL =
  "You are an Associate Product Manager at Nexus Bank, one of the UK's established challenger banks. The executive team has identified a gap in the market: a business bank account designed specifically for early-stage startups. Two fintech competitors launched similar products six months ago and are gaining traction. Your task is to define what Nexus Bank's startup account should offer, why, and how. Over the next five tasks, you will conduct market discovery, analyse the competitive landscape, define the product strategy, plan your stakeholder communication, and produce a strategic summary. You have two weeks before your first executive presentation. Work methodically and show your thinking clearly.";

const VIDEO_TRANSCRIPT =
  "Hi, welcome to the Nexus Bank Product Strategy simulation. I'm Sarah Chen, Head of Product here. We're really excited to have you on the team. So here's the situation — we've been watching the startup banking market closely for the last twelve months and we think there's a real opportunity for Nexus Bank to enter this space with a product that's genuinely different. Two competitors got there before us, but we believe their products have real gaps, especially for seed and pre-seed stage companies. Your job over the next two weeks is to help us figure out what our startup account should actually be. Don't just tell us what features to build — tell us what problems we're solving and why our approach will win. Start by getting into the market. Talk to people, look at the data, understand what startups actually need from a business bank account versus what they say they need. Good luck. I'm looking forward to seeing what you come up with.";

// ── Types ────────────────────────────────────────────────────────

type PromptType = "typed" | "upload" | "url" | "either";

interface Prompt {
  id: number;
  type: PromptType;
  title: string;
  question: string;
  guidance: string[];
  minWords: number;
}

interface StepResponse {
  text?: string;
  file?: { name: string; size: number } | null;
  url?: string;
  rationale?: string;
  mode?: "typed" | "upload";
}

// ── Prompt data ──────────────────────────────────────────────────

const PROMPTS: Prompt[] = [
  {
    id: 1,
    type: "typed",
    title: "Market Discovery",
    question:
      "Before you can define what the Nexus Bank startup account will offer, you need to understand the market. Describe the research process you would use to identify what startups actually need from a business bank account. Who would you speak to, what questions would you ask, and how would you validate your findings before using them to shape the product?",
    guidance: [
      "Consider both internal and external research sources",
      "Think about who holds the most relevant knowledge inside Nexus Bank",
      "Focus on validating assumptions not just gathering information",
      "Quality of insight matters more than quantity of sources",
    ],
    minWords: 200,
  },
  {
    id: 2,
    type: "typed",
    title: "Competitive Landscape",
    question:
      "Two fintech competitors launched dedicated startup accounts in the last six months and are gaining traction. Analyse the competitive landscape. What are these competitors offering, where are their gaps, and what could Nexus Bank uniquely offer that they cannot?",
    guidance: [
      "Go beyond surface level feature comparisons",
      "Think about what startups value most at different growth stages",
      "Consider what Nexus Bank can realistically offer that fintechs cannot",
      "Connect your analysis directly to product decisions",
    ],
    minWords: 200,
  },
  {
    id: 3,
    type: "either",
    title: "Product Strategy Definition",
    question:
      "Based on your market research and competitive analysis, define the product strategy for the Nexus Bank startup account. What are the two or three core features you would prioritise for the first release, and why? How would you handle the tension between what startups want and what compliance teams will accept?",
    guidance: [
      "Prioritise based on validated needs not assumptions",
      "Acknowledge real constraints rather than ignoring them",
      "Show your prioritisation logic clearly",
      "Think about what success looks like at six months post-launch",
    ],
    minWords: 200,
  },
  {
    id: 4,
    type: "typed",
    title: "Stakeholder Communication",
    question:
      "You need to present your initial product direction to the CEO at the end of week two. How would you structure this communication? What would you include, what would you leave out, and how would you handle questions about areas of uncertainty?",
    guidance: [
      "Think about what the CEO needs to make a decision",
      "Be honest about assumptions and uncertainties",
      "Structure matters as much as content",
      "Anticipate the hardest questions you might face",
    ],
    minWords: 200,
  },
  {
    id: 5,
    type: "url",
    title: "Strategic Summary",
    question:
      "Using any tool of your choice, produce a one page strategic summary outlining your recommended approach, key assumptions, and the biggest risks you see at this stage. Share the link to your completed document below and explain your strategic choices in the rationale field.",
    guidance: [
      "Keep it to one page maximum",
      "Be explicit about what you know versus what you are assuming",
      "Prioritise clarity over comprehensiveness",
      "Think about what a CEO needs to see to feel confident moving forward",
    ],
    minWords: 100,
  },
];

const TIME_REMAINING = [45, 36, 27, 17, 8]; // minutes remaining at start of each step

// ── Helpers ──────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ── SVG icons ────────────────────────────────────────────────────

function CheckCircle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill={TEAL} />
      <polyline
        points="4,8 7,11 12,5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ClockIcon({ color = "#aaa" }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21,15v4a2,2,0,0,1-2,2H5a2,2,0,0,1-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points={open ? "18,15 12,9 6,15" : "6,9 12,15 18,9"} />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function SimulatePage() {
  const [scrolled, setScrolled] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, StepResponse>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [briefExpanded, setBriefExpanded] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [muted, setMuted] = useState(true);

  // Supporting evidence state
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [attachedUrls, setAttachedUrls] = useState<string[]>([]);
  const [fileError, setFileError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prompt = PROMPTS[currentStep];
  const response: StepResponse = responses[currentStep] ?? {};
  const mode = response.mode ?? "typed";

  const textValue = response.text ?? "";
  const rationaleValue = response.rationale ?? "";
  const urlValue = response.url ?? "";

  const wc = countWords(textValue);
  const rwc = countWords(rationaleValue);
  const wcMet = wc >= prompt.minWords;
  const rwcMet = rwc >= (prompt.id === 5 ? 100 : prompt.minWords);

  // ── Update response for current step
  const updateResponse = useCallback(
    (patch: Partial<StepResponse>) => {
      setResponses((prev) => ({
        ...prev,
        [currentStep]: { ...prev[currentStep], ...patch },
      }));
    },
    [currentStep]
  );

  // ── Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sim-product-strategy");
      if (saved) {
        const data = JSON.parse(saved);
        if (typeof data.currentStep === "number") setCurrentStep(data.currentStep);
        if (data.responses) setResponses(data.responses);
        if (data.attachedUrls) setAttachedUrls(data.attachedUrls);
      }
    } catch { /* ignore */ }
  }, []);

  // ── Save to localStorage
  const saveToStorage = useCallback(() => {
    setSaveStatus("saving");
    setTimeout(() => {
      try {
        localStorage.setItem(
          "sim-product-strategy",
          JSON.stringify({ currentStep, responses, attachedUrls })
        );
        setLastSaved(new Date());
        setSaveStatus("saved");
      } catch { /* ignore */ }
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);
  }, [currentStep, responses, attachedUrls]);

  // ── Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveToStorage, 30000);
    return () => clearInterval(interval);
  }, [saveToStorage]);

  // ── Navbar scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Last saved display
  function lastSavedText(): string {
    if (!lastSaved) return "Not yet saved";
    const diff = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 120) return "1 min ago";
    return `${Math.floor(diff / 60)} mins ago`;
  }

  // ── Navigation
  function goNext() {
    saveToStorage();
    if (currentStep < 4) setCurrentStep((s) => s + 1);
  }
  function goPrev() {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }

  // ── File handler
  function handleFile(file: File) {
    updateResponse({ file: { name: file.name, size: file.size } });
  }

  // ── Either-type toggle buttons
  function EitherToggle() {
    return (
      <div className="flex gap-2 mb-5">
        {(["typed", "upload"] as const).map((m) => (
          <button
            key={m}
            onClick={() => updateResponse({ mode: m })}
            className="text-xs font-medium uppercase px-4 py-2"
            style={{
              border: `1px solid ${mode === m ? NAVY : BORDER}`,
              backgroundColor: mode === m ? NAVY : "#fff",
              color: mode === m ? "#fff" : "#888",
              letterSpacing: "0.1em",
            }}
          >
            {m === "typed" ? "Write Response" : "Upload Document"}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          backgroundColor: "#ffffff",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between relative">
          <a href="/">
            <img
              src="/logo-colour.png"
              alt="Career Bridge Foundation"
              style={{ height: "40px", width: "auto" }}
            />
          </a>
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {["Simulations", "For Coaches", "About", "Blog"].map((link) => (
              <a
                key={link}
                href={`/${link.toLowerCase().replace(/ /g, "-")}`}
                className="text-xs font-medium uppercase hover:opacity-60 transition-opacity"
                style={{ color: NAVY, letterSpacing: "0.12em" }}
              >
                {link}
              </a>
            ))}
          </nav>
          <a
            href="#"
            className="btn-apply text-xs font-medium uppercase px-5 py-2.5"
            style={{ letterSpacing: "0.12em" }}
          >
            Apply
          </a>
        </div>
      </header>

      {/* ── MOBILE PROGRESS BAR ─────────────────────────────────── */}
      <div
        className="lg:hidden fixed z-40 left-0 right-0 bg-white px-5 py-3"
        style={{ top: "73px", borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: NAVY }}>
            Task {currentStep + 1} of 5 · {prompt.title}
          </span>
          <span className="text-xs" style={{ color: "#999" }}>
            ~{TIME_REMAINING[currentStep]} mins left
          </span>
        </div>
        <div className="w-full h-1 rounded-full" style={{ backgroundColor: BORDER }}>
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / 5) * 100}%`,
              backgroundColor: TEAL,
            }}
          />
        </div>
      </div>

      {/* ── THREE-COLUMN LAYOUT ─────────────────────────────────── */}
      <div className="flex" style={{ paddingTop: "73px" }}>

        {/* ── LEFT SIDEBAR ───────────────────────────────────────── */}
        <aside
          className="hidden lg:flex flex-col w-[280px] shrink-0 sticky self-start overflow-y-auto"
          style={{
            top: "73px",
            height: "calc(100vh - 73px)",
            borderRight: `1px solid ${BORDER}`,
          }}
        >
          <div className="p-6 flex flex-col gap-6 h-full">

            {/* Simulation info */}
            <div>
              <span
                className="text-xs font-semibold uppercase block mb-2"
                style={{ color: TEAL, letterSpacing: "0.14em" }}
              >
                This Assessment
              </span>
              <h2 className="text-base font-bold mb-1" style={{ color: NAVY }}>
                {SIM.title}
              </h2>
              <p className="text-xs mb-3" style={{ color: "#888" }}>
                {SIM.company} · {SIM.industry}
              </p>
              {/* Credential badge */}
              <div className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M8.56,17.39L7,22l5-3,5,3-1.56-4.61" />
                </svg>
                <span className="text-xs font-medium" style={{ color: TEAL }}>
                  Earns a verified credential
                </span>
              </div>
              <div className="mt-4 h-px" style={{ backgroundColor: BORDER }} />
            </div>

            {/* Progress steps */}
            <div className="flex-1">
              <span
                className="text-xs font-semibold uppercase block mb-4"
                style={{ color: NAVY, letterSpacing: "0.12em" }}
              >
                Assessment Tasks
              </span>
              <div className="flex flex-col gap-4">
                {PROMPTS.map((p, i) => {
                  const isCompleted = i < currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <div key={p.id} className="flex items-start gap-3">
                      {/* Status indicator */}
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle />
                        ) : isCurrent ? (
                          <div
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                            style={{ borderColor: TEAL }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: TEAL }}
                            />
                          </div>
                        ) : (
                          <div
                            className="w-4 h-4 rounded-full border-2"
                            style={{ borderColor: "#ddd" }}
                          />
                        )}
                      </div>
                      <div>
                        <span
                          className="text-xs font-semibold uppercase block"
                          style={{
                            color: isCurrent ? TEAL : isCompleted ? "#888" : "#ccc",
                            letterSpacing: "0.12em",
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="text-xs leading-snug"
                          style={{
                            color: isCurrent ? NAVY : isCompleted ? "#888" : "#bbb",
                            fontWeight: isCurrent ? 600 : 400,
                          }}
                        >
                          {p.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Credential note */}
            <p className="text-xs italic leading-relaxed" style={{ color: "#bbb", lineHeight: 1.7 }}>
              Complete all tasks to earn your verified Career Bridge credential for this simulation.
            </p>

            {/* Save status */}
            <div className="pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
              <p className="text-xs italic" style={{ color: "#bbb" }}>
                Last saved: {lastSavedText()}
              </p>
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 mt-[52px] lg:mt-0">
          <div className="max-w-[700px] mx-auto px-6 py-8">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-7">
              <span className="text-xs" style={{ color: "#999" }}>
                Task {currentStep + 1} of 5
              </span>
              <div className="flex items-center gap-3">
                {saveStatus === "saving" && (
                  <span className="text-xs italic" style={{ color: "#bbb" }}>
                    Saving…
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span
                    className="text-xs flex items-center gap-1.5"
                    style={{ color: TEAL }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <polyline points="2,6 5,9 10,3" stroke={TEAL} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Saved
                  </span>
                )}
                <a
                  href="/simulations/product-management"
                  className="text-xs font-medium px-4 py-2"
                  style={{ border: `1px solid ${NAVY}`, color: NAVY }}
                >
                  Exit Assessment
                </a>
              </div>
            </div>

            {/* Scenario context card — Step 1 only */}
            {currentStep === 0 && (
              <div
                className="mb-6 p-5"
                style={{
                  backgroundColor: LIGHT_GREY,
                  borderLeft: `4px solid ${TEAL}`,
                }}
              >
                <span
                  className="text-xs font-semibold uppercase block mb-2"
                  style={{ color: "#999", letterSpacing: "0.14em" }}
                >
                  Simulation Context
                </span>
                <p className="text-sm font-bold mb-2" style={{ color: NAVY }}>
                  {SIM.role} · {SIM.company}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#555", lineHeight: 1.75 }}
                >
                  {briefExpanded ? BRIEF_FULL : BRIEF_SHORT}
                </p>
                <button
                  onClick={() => setBriefExpanded((v) => !v)}
                  className="mt-3 text-sm font-medium"
                  style={{ color: TEAL }}
                >
                  {briefExpanded ? "Hide full brief ↑" : "View full brief →"}
                </button>
              </div>
            )}

            {/* Video section */}
            <div className="mb-6" style={{ border: `1px solid ${BORDER}` }}>
              {/* Video player placeholder */}
              <div
                className="relative w-full flex items-center justify-center bg-[#001a2e]"
                style={{ aspectRatio: "16/9" }}
              >
                <div className="text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.08)",
                      border: "2px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    Video briefing · {SIM.company}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                    From Sarah Chen, Head of Product
                  </p>
                </div>
                {/* Controls */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <button
                    onClick={() => setMuted((m) => !m)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.55)",
                      color: "rgba(255,255,255,0.8)",
                      borderRadius: "3px",
                    }}
                  >
                    {muted ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                          <line x1="23" y1="9" x2="17" y2="15" />
                          <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                        Unmute
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" />
                          <path d="M19.07,4.93a10,10,0,0,1,0,14.14" />
                          <path d="M15.54,8.46a5,5,0,0,1,0,7.07" />
                        </svg>
                        Mute
                      </>
                    )}
                  </button>
                  <button
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.55)",
                      color: "rgba(255,255,255,0.8)",
                      borderRadius: "3px",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="1,4 1,10 7,10" />
                      <path d="M3.51,15a9,9,0,1,0,.49-3.87" />
                    </svg>
                    Replay
                  </button>
                </div>
              </div>

              {/* Transcript toggle */}
              <div className="bg-white p-4">
                <button
                  onClick={() => setTranscriptOpen((v) => !v)}
                  className="flex items-center gap-2 text-xs font-medium"
                  style={{ color: TEAL }}
                >
                  <ChevronIcon open={transcriptOpen} />
                  {transcriptOpen ? "Hide transcript" : "Show transcript"}
                </button>
                {transcriptOpen && (
                  <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <span
                      className="text-xs font-semibold uppercase block mb-2"
                      style={{ color: "#bbb", letterSpacing: "0.12em" }}
                    >
                      Transcript
                    </span>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#777", lineHeight: 1.8 }}
                    >
                      {VIDEO_TRANSCRIPT}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt card */}
            <div
              className="mb-6 p-7"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <span
                className="text-xs font-semibold uppercase block mb-3"
                style={{ color: TEAL, letterSpacing: "0.16em" }}
              >
                Task {String(currentStep + 1).padStart(2, "0")}
              </span>
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: NAVY, lineHeight: 1.3 }}
              >
                {prompt.title}
              </h2>
              <p
                className="text-base"
                style={{ color: "#444", lineHeight: 1.85 }}
              >
                {prompt.question}
              </p>
            </div>

            {/* ── SUBMISSION AREA ──────────────────────────────── */}

            {/* TYPED (standalone or either+typed) */}
            {(prompt.type === "typed" ||
              (prompt.type === "either" && mode === "typed")) && (
              <div className="mb-8">
                {prompt.type === "either" && <EitherToggle />}
                <span
                  className="text-xs font-semibold uppercase block mb-1.5"
                  style={{ color: "#888", letterSpacing: "0.14em" }}
                >
                  Your Response
                </span>
                <p className="text-xs mb-3" style={{ color: "#bbb" }}>
                  Minimum {prompt.minWords} words. Write as you would in a real workplace context.
                </p>
                <textarea
                  value={textValue}
                  onChange={(e) => updateResponse({ text: e.target.value })}
                  placeholder="Begin your response here..."
                  className="w-full p-5 text-sm resize-none"
                  style={{
                    minHeight: "220px",
                    border: `1px solid ${BORDER}`,
                    color: "#333",
                    lineHeight: 1.8,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = TEAL)}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
                />
                <p
                  className="mt-2 text-xs"
                  style={{ color: wcMet ? TEAL : "#bbb" }}
                >
                  {wc} / {prompt.minWords} words minimum
                </p>
              </div>
            )}

            {/* UPLOAD (standalone or either+upload) */}
            {(prompt.type === "upload" ||
              (prompt.type === "either" && mode === "upload")) && (
              <div className="mb-8">
                {prompt.type === "either" && <EitherToggle />}
                <span
                  className="text-xs font-semibold uppercase block mb-3"
                  style={{ color: "#888", letterSpacing: "0.14em" }}
                >
                  Your Submission
                </span>
                {response.file ? (
                  <div
                    className="flex items-center justify-between p-4"
                    style={{
                      border: `1px solid ${TEAL}`,
                      backgroundColor: "rgba(77,197,210,0.04)",
                    }}
                  >
                    <span
                      className="flex items-center gap-2 text-sm"
                      style={{ color: NAVY }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      {response.file.name}
                      <span className="text-xs" style={{ color: "#aaa" }}>
                        ({(response.file.size / 1024).toFixed(0)} KB)
                      </span>
                    </span>
                    <button
                      onClick={() => updateResponse({ file: null })}
                      className="text-xs"
                      style={{ color: "#aaa" }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center p-12 cursor-pointer"
                    style={{
                      border: `2px dashed ${TEAL}`,
                      backgroundColor: "rgba(77,197,210,0.02)",
                    }}
                  >
                    <UploadIcon />
                    <span
                      className="text-sm font-medium mt-3 mb-1"
                      style={{ color: NAVY }}
                    >
                      Drag and drop your file here
                    </span>
                    <span className="text-xs mb-4" style={{ color: "#aaa" }}>
                      or click to browse
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        e.target.files?.[0] && handleFile(e.target.files[0])
                      }
                    />
                    <span className="text-xs" style={{ color: "#ccc" }}>
                      Accepted formats: PDF, Word. Maximum 10MB.
                    </span>
                  </label>
                )}
              </div>
            )}

            {/* URL */}
            {prompt.type === "url" && (
              <div className="mb-8">
                <span
                  className="text-xs font-semibold uppercase block mb-1.5"
                  style={{ color: "#888", letterSpacing: "0.14em" }}
                >
                  Your Submission
                </span>
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => updateResponse({ url: e.target.value })}
                  placeholder="Paste your public link here e.g. Figma, Notion, Google Docs"
                  className="w-full p-3.5 text-sm mb-1"
                  style={{
                    border: `1px solid ${
                      urlValue && !isValidUrl(urlValue) ? "#e53e3e" : BORDER
                    }`,
                    color: "#333",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = TEAL)}
                  onBlur={(e) =>
                    (e.target.style.borderColor =
                      urlValue && !isValidUrl(urlValue) ? "#e53e3e" : BORDER)
                  }
                />
                {urlValue && !isValidUrl(urlValue) && (
                  <p className="text-xs mb-1" style={{ color: "#e53e3e" }}>
                    Please enter a valid URL starting with https://
                  </p>
                )}
                {urlValue && isValidUrl(urlValue) && (
                  <p className="text-xs mb-1 flex items-center gap-1" style={{ color: TEAL }}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <polyline points="2,6 5,9 10,3" stroke={TEAL} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Valid URL
                  </p>
                )}

                <div className="mt-6">
                  <span
                    className="text-xs font-semibold uppercase block mb-1.5"
                    style={{ color: "#888", letterSpacing: "0.14em" }}
                  >
                    Rationale
                  </span>
                  <p className="text-xs mb-3" style={{ color: "#bbb" }}>
                    Explain your thinking and approach in 100 to 200 words.
                  </p>
                  <textarea
                    value={rationaleValue}
                    onChange={(e) => updateResponse({ rationale: e.target.value })}
                    placeholder="Explain your strategic choices and approach..."
                    className="w-full p-5 text-sm resize-none"
                    style={{
                      minHeight: "160px",
                      border: `1px solid ${BORDER}`,
                      color: "#333",
                      lineHeight: 1.8,
                      outline: "none",
                      fontFamily: "inherit",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = TEAL)}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  />
                  <p
                    className="mt-2 text-xs"
                    style={{ color: rwcMet ? TEAL : "#bbb" }}
                  >
                    {rwc} / 100 words minimum
                  </p>
                </div>
              </div>
            )}

            {/* ── SUPPORTING EVIDENCE ─────────────────────────────── */}
            <div className="mb-8">
              {/* Section header */}
              <div className="flex items-baseline gap-2 mb-4">
                <span
                  className="text-xs font-semibold uppercase"
                  style={{ color: NAVY, letterSpacing: "0.13em", fontSize: "11px" }}
                >
                  Supporting Evidence
                </span>
                <span className="text-xs" style={{ color: "#aaa" }}>
                  (optional)
                </span>
              </div>

              {/* File upload zone */}
              <div
                className="mb-4"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  setFileError("");
                  const newFiles = Array.from(e.dataTransfer.files);
                  const allowed = ["application/pdf", "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-powerpoint",
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    "image/png", "image/jpeg", "text/csv"];
                  const combined = [...uploadedFiles, ...newFiles];
                  if (combined.length > 3) { setFileError("Maximum 3 files allowed."); return; }
                  for (const f of newFiles) {
                    if (!allowed.includes(f.type)) { setFileError(`"${f.name}" is not an accepted file type.`); return; }
                    if (f.size > 10 * 1024 * 1024) { setFileError(`"${f.name}" exceeds the 10MB limit.`); return; }
                  }
                  setUploadedFiles(combined);
                }}
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-8 px-6 cursor-pointer transition-colors"
                  style={{
                    border: `2px dashed ${dragOver ? TEAL : "#D5DCE8"}`,
                    backgroundColor: dragOver ? "rgba(77,197,210,0.04)" : "#fff",
                  }}
                >
                  {/* Upload cloud icon */}
                  <svg
                    width="28" height="28" viewBox="0 0 24 24" fill="none"
                    stroke={dragOver ? TEAL : "#bbb"} strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    className="mb-2"
                  >
                    <polyline points="16,16 12,12 8,16" />
                    <line x1="12" y1="12" x2="12" y2="21" />
                    <path d="M20.39,18.39A5,5,0,0,0,18,9h-1.26A8,8,0,1,0,3,16.3" />
                  </svg>
                  <p className="text-sm" style={{ color: "#555" }}>
                    Drag &amp; drop files here, or{" "}
                    <span
                      className="underline"
                      style={{ color: "#006FAD" }}
                    >
                      browse
                    </span>
                  </p>
                  <p className="text-xs mt-1.5" style={{ color: "#bbb" }}>
                    PDF, DOCX, XLSX, PPTX, PNG, JPG, CSV — max 10MB each — up to 3 files
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.csv"
                  className="hidden"
                  onChange={(e) => {
                    setFileError("");
                    const newFiles = Array.from(e.target.files ?? []);
                    const allowed = ["application/pdf", "application/msword",
                      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                      "application/vnd.ms-excel",
                      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                      "application/vnd.ms-powerpoint",
                      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                      "image/png", "image/jpeg", "text/csv"];
                    const combined = [...uploadedFiles, ...newFiles];
                    if (combined.length > 3) { setFileError("Maximum 3 files allowed."); e.target.value = ""; return; }
                    for (const f of newFiles) {
                      if (!allowed.includes(f.type)) { setFileError(`"${f.name}" is not an accepted file type.`); e.target.value = ""; return; }
                      if (f.size > 10 * 1024 * 1024) { setFileError(`"${f.name}" exceeds the 10MB limit.`); e.target.value = ""; return; }
                    }
                    setUploadedFiles(combined);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* File error */}
              {fileError && (
                <p className="text-xs mb-2" style={{ color: "#e53e3e" }}>{fileError}</p>
              )}

              {/* File chips */}
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {uploadedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs"
                      style={{ backgroundColor: LIGHT_GREY, color: NAVY }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round">
                        <path d="M13,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V9Z" />
                        <polyline points="13,2 13,9 20,9" />
                      </svg>
                      <span className="font-medium">{f.name}</span>
                      <span style={{ color: "#aaa" }}>({(f.size / 1024).toFixed(0)} KB)</span>
                      <button
                        onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))}
                        className="ml-1 font-bold"
                        style={{ color: "#bbb" }}
                        aria-label="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* URL attachment */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
                    <path d="M10,13a5,5,0,0,0,7.54.54l3-3a5,5,0,0,0-7.07-7.07l-1.72,1.71" />
                    <path d="M14,11a5,5,0,0,0-7.54-.54l-3,3a5,5,0,0,0,7.07,7.07l1.71-1.71" />
                  </svg>
                  <span className="text-xs font-medium" style={{ color: "#888" }}>
                    Attach a URL
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      e.preventDefault();
                      const trimmed = urlInput.trim();
                      if (!trimmed) return;
                      if (!isValidUrl(trimmed)) { setUrlError("Please enter a valid URL starting with https://"); return; }
                      if (attachedUrls.includes(trimmed)) { setUrlError("This URL has already been added."); return; }
                      setAttachedUrls((prev) => [...prev, trimmed]);
                      setUrlInput("");
                      setUrlError("");
                    }}
                    placeholder="https://docs.google.com/..."
                    className="flex-1 px-3 py-2 text-sm"
                    style={{ border: `1px solid ${BORDER}`, color: "#333", outline: "none", fontFamily: "inherit" }}
                    onFocus={(e) => (e.target.style.borderColor = TEAL)}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  />
                  <button
                    onClick={() => {
                      const trimmed = urlInput.trim();
                      if (!trimmed) return;
                      if (!isValidUrl(trimmed)) { setUrlError("Please enter a valid URL starting with https://"); return; }
                      if (attachedUrls.includes(trimmed)) { setUrlError("This URL has already been added."); return; }
                      setAttachedUrls((prev) => [...prev, trimmed]);
                      setUrlInput("");
                      setUrlError("");
                    }}
                    className="px-4 py-2 text-xs font-medium text-white shrink-0"
                    style={{ backgroundColor: "#006FAD" }}
                  >
                    Add
                  </button>
                </div>

                {/* URL error */}
                {urlError && (
                  <p className="text-xs mt-1" style={{ color: "#e53e3e" }}>{urlError}</p>
                )}

                {/* URL chips */}
                {attachedUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {attachedUrls.map((url, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs max-w-full"
                        style={{ backgroundColor: "#EBF4FB", color: "#006FAD" }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#006FAD" strokeWidth="2" strokeLinecap="round">
                          <path d="M10,13a5,5,0,0,0,7.54.54l3-3a5,5,0,0,0-7.07-7.07l-1.72,1.71" />
                          <path d="M14,11a5,5,0,0,0-7.54-.54l-3,3a5,5,0,0,0,7.07,7.07l1.71-1.71" />
                        </svg>
                        <span className="truncate" style={{ maxWidth: "240px" }}>{url}</span>
                        <button
                          onClick={() => setAttachedUrls((prev) => prev.filter((_, j) => j !== i))}
                          className="ml-1 font-bold shrink-0"
                          style={{ color: "#6aabce" }}
                          aria-label="Remove URL"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── NAVIGATION BUTTONS ─────────────────────────────── */}
            <div className="flex items-center justify-between pt-2 pb-16">
              <div>
                {currentStep > 0 && (
                  <button
                    onClick={goPrev}
                    className="text-sm font-medium px-6 py-3"
                    style={{
                      border: `1px solid ${NAVY}`,
                      color: NAVY,
                      backgroundColor: "#fff",
                    }}
                  >
                    ← Previous
                  </button>
                )}
              </div>
              <button
                onClick={currentStep < 4 ? goNext : saveToStorage}
                className="text-sm font-semibold px-7 py-3"
                style={{
                  backgroundColor: currentStep === 4 ? TEAL : NAVY,
                  color: "#fff",
                  fontSize: currentStep === 4 ? "0.9375rem" : undefined,
                }}
              >
                {currentStep < 4 ? "Save and Continue →" : "Submit Simulation →"}
              </button>
            </div>

          </div>
        </main>

        {/* ── RIGHT SIDEBAR ────────────────────────────────────────── */}
        <aside
          className="hidden xl:flex flex-col w-[240px] shrink-0 sticky self-start overflow-y-auto"
          style={{
            top: "73px",
            height: "calc(100vh - 73px)",
            borderLeft: `1px solid ${BORDER}`,
          }}
        >
          <div className="p-5 flex flex-col gap-4">

            {/* Task guidance */}
            <div className="p-4" style={{ border: `1px solid ${BORDER}` }}>
              <span
                className="text-xs font-semibold uppercase block mb-2"
                style={{ color: TEAL, letterSpacing: "0.14em" }}
              >
                Task Guidance
              </span>
              <h4 className="text-sm font-bold mb-3" style={{ color: NAVY, lineHeight: 1.35 }}>
                {prompt.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {prompt.guidance.map((g, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-xs leading-relaxed"
                    style={{ color: "#555" }}
                  >
                    <span
                      className="shrink-0 font-bold"
                      style={{ color: TEAL }}
                    >
                      —
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>

            {/* Need support */}
            <div className="p-4" style={{ backgroundColor: LIGHT_GREY }}>
              <span
                className="text-xs font-semibold uppercase block mb-2"
                style={{ color: "#aaa", letterSpacing: "0.14em" }}
              >
                Need Support?
              </span>
              <p
                className="text-xs leading-relaxed mb-3"
                style={{ color: "#666", lineHeight: 1.75 }}
              >
                Our team is here to help. Reach out if you have any questions
                about this simulation.
              </p>
              <a
                href="mailto:support@careerbridgefoundation.zohodesk.eu"
                className="text-xs font-medium"
                style={{ color: TEAL }}
              >
                Contact support →
              </a>
            </div>

            {/* Time estimate */}
            <div
              className="p-4 flex items-center gap-2"
              style={{ border: `1px solid ${BORDER}` }}
            >
              <ClockIcon />
              <span className="text-xs" style={{ color: "#888" }}>
                Approx {TIME_REMAINING[currentStep]} mins remaining
              </span>
            </div>

          </div>
        </aside>

      </div>
    </div>
  );
}
