"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SAMPLE_MARKDOWN = `I now have comprehensive data to map out pathways. Let me compile the findings.

# Pathways to Decision Makers at [Vale](https://console.harmonic.ai/dashboard/company/1390456)

Your team has **strong, active connections** to Vale — with **12 team members in-network** and **24 tracked connections** to Vale personnel. Here's a breakdown of the most valuable pathways to key decision makers.

---

## 🔥 Strongest Pathway: Bruno Arcadier — Head of New Ventures

[Bruno Arcadier](https://console.harmonic.ai/dashboard/person/168092702) | **Head of New Ventures — Vale Ventures & New Business Development** (Rio de Janeiro)

This is your **best-connected contact at Vale**, with **7 team members** connected to him across multiple channels:

| Team Member | Connection Type | Latest Activity |
|---|---|---|
| **Carlos Trevino** | LinkedIn + Email + Calendar | Email exchange on Mar 25, 2026 RE: "Newlab × Oman – Intro to Roberta" |
| **Brandon Corts** | Email + Calendar | Email Mar 19, 2025 RE: "Newlab Follow-Up" |
| **Garrett Winther** | Email | Email Mar 1, 2026 (via Mantel investor update thread) |
| **Muneef AlMuneef** | Email | Email Mar 25, 2026 RE: "Newlab × Oman – Intro to Roberta" |
| **Sahil Jain** | LinkedIn | — |
| **Michelle Brechtelsbauer** | LinkedIn | — |
| **Mia Lu** | — | In-person "Vale x Newlab" meeting, Mar 2025 |

Bruno also serves as **Board Observer** at Allonnia and Boston Metal, signaling he runs Vale's CVC/venture arm. **Carlos Trevino is the most active conduit** — he's been exchanging emails with Bruno as recently as March 2026 on partnership initiatives.

---

## 🌟 Key Decision Maker Connections

### Innovation & Decarbonization Leadership

| Vale Contact | Title | Connected To | Channel | Last Activity |
|---|---|---|---|---|
| [Leandro Teixeira](https://console.harmonic.ai/dashboard/person/48568930) | **Head of Innovation** + President, Mining Hub | Mia Lu | Email + Calendar | Jan 2024 — AMIRA x Newlab follow-up |
| [Breno Castilho](https://console.harmonic.ai/dashboard/person/105736591) | **General Manager — Geotech Governance & Compliance** | Mia Lu | Email | Aug 2023 — Decarbonization program invite |
| [Emily Olson](https://console.harmonic.ai/dashboard/person/31938842) | **Chief Sustainability & Corporate Affairs Officer, Vale Base Metals** | Carlos Trevino | LinkedIn | — |
| [Makesha Judson](https://console.harmonic.ai/dashboard/person/37476363) | **Managing Director, Government Relations & Public Affairs, Vale USA** | Mia Lu | LinkedIn | — |
| [Frederico Mayerhofer](https://console.harmonic.ai/dashboard/person/7769498) | **Senior Manager, Decarbonization & Technology** | Garrett Winther | Email (cc'd) | — |
| [Marcelo Ribeiro Carlos](https://console.harmonic.ai/dashboard/person/93809371) | **Manager, Decarbonization Project Development** | Mia Lu | Email (cc'd) | — |
| [Taila Lemos](https://console.harmonic.ai/dashboard/person/27921196) | **CVC Senior Business Analyst** | Garrett Winther | Email (cc'd) | — |

### Additional Vale Contacts (via email threads)

Several Vale email addresses appear in correspondence but don't yet have enriched profiles: **Roberta Milagres**, **Patricia Ulrich**, **Andrew De Simone**, **Bruno Pelli**, **Yago Morais Zocoli**, **Alexandre Salomao Andrade**, **Patrice Mazzoni**, and **Neymayer Lima**.

---

## 🚀 Recommended Actions

1. **For immediate outreach to Vale Ventures/CVC**: Ask **Carlos Trevino** — he has the freshest, multi-channel relationship with Bruno Arcadier (email as recent as March 25, 2026) and is actively coordinating "Vale (Oman) x Newlab (KSA) co-product initiatives."

2. **For Vale's Innovation team**: **Mia Lu** is your best path to **Leandro Teixeira** (Head of Innovation) via prior email/calendar engagement through the AMIRA Global x Newlab program.

3. **For Sustainability/ESG**: **Carlos Trevino** has a LinkedIn connection to **Emily Olson** (Chief Sustainability Officer, Vale Base Metals in Toronto).

4. **For US Government Relations**: **Mia Lu** is LinkedIn-connected to **Makesha Judson** (MD, Government Relations, Vale USA).

5. **Very active right now**: A "Vale (Oman) x Newlab (KSA) — co-product initiatives" calendar event took place just **yesterday** (Apr 2, 2026) with Roberta Milagres from Vale, Carlos Trevino, Muneef AlMuneef, Rayed Al Shamekh, and Sahil Jain. This is a live, active partnership track.

*Source: Harmonic — team network connections to Vale (vale.com)*`;

export default function Home() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [mode, setMode] = useState<"view" | "edit">("view");

  const handlePaste = useCallback(() => {
    setMode("edit");
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f8f9fa" }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 h-14 border-b shrink-0"
        style={{
          background: "#ffffff",
          borderColor: "#e5e7eb",
        }}
      >
        <div className="flex items-center gap-3">
          <HarmonicLogo />
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{ background: "#f3f4f6", color: "#6b7280" }}
          >
            Ask Scout
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode(mode === "view" ? "edit" : "view")}
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            style={{
              background: mode === "edit" ? "#6366f1" : "#f3f4f6",
              color: mode === "edit" ? "#ffffff" : "#374151",
            }}
          >
            {mode === "edit" ? "Preview" : "Edit Markdown"}
          </button>
          {mode === "edit" && (
            <button
              onClick={() => setMarkdown("")}
              className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
              style={{ background: "#f3f4f6", color: "#374151" }}
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex justify-center py-8 px-4">
        <div
          className="w-full rounded-lg border shadow-sm"
          style={{
            maxWidth: "900px",
            background: "#ffffff",
            borderColor: "#e5e7eb",
          }}
        >
          {mode === "edit" ? (
            <textarea
              className="markdown-input w-full h-full min-h-[80vh] p-8 rounded-lg border-0"
              style={{ background: "#ffffff" }}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              onPaste={handlePaste}
              placeholder="Paste your Harmonic markdown output here..."
              spellCheck={false}
            />
          ) : (
            <div className="harmonic-content p-8">
              {markdown ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ children }) => (
                      <div className="table-wrapper">
                        <table>{children}</table>
                      </div>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {markdown}
                </ReactMarkdown>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div
                    className="text-sm font-medium mb-2"
                    style={{ color: "#6b7280" }}
                  >
                    No content yet
                  </div>
                  <div className="text-xs" style={{ color: "#9ca3af" }}>
                    Click &quot;Edit Markdown&quot; and paste your Harmonic
                    output
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function HarmonicLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#6366f1" />
        <path
          d="M7 8.5C7 8.22386 7.22386 8 7.5 8H9.5C9.77614 8 10 8.22386 10 8.5V15.5C10 15.7761 9.77614 16 9.5 16H7.5C7.22386 16 7 15.7761 7 15.5V8.5Z"
          fill="white"
        />
        <path
          d="M11 11H13V13H11V11Z"
          fill="white"
        />
        <path
          d="M14 8.5C14 8.22386 14.2239 8 14.5 8H16.5C16.7761 8 17 8.22386 17 8.5V15.5C17 15.7761 16.7761 16 16.5 16H14.5C14.2239 16 14 15.7761 14 15.5V8.5Z"
          fill="white"
        />
      </svg>
      <span className="font-semibold text-sm" style={{ color: "#111827" }}>
        Harmonic
      </span>
    </div>
  );
}
