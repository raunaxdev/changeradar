"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChangeCard, type ChangeReportItem, type RiskLevel } from "@/components/ChangeCard";
import { ArrowRightIcon, CheckIcon, RadarIcon, ShieldIcon, TrashIcon } from "@/components/Icons";
import { HowItWorks } from "@/components/HowItWorks";
import { ProcessingStepper } from "@/components/ProcessingStepper";
import { UploadCard } from "@/components/UploadCard";

type ApiChange = {
  change_type: "modified" | "added" | "deleted";
  page: number;
  paragraph: number;
  old_text: string;
  new_text: string;
};

type ApiAnalysis = {
  consequence: string;
  risk_level: RiskLevel;
  questions_to_ask: string[];
};

type CompareResponse = {
  changes: ApiChange[];
  analyses: ApiAnalysis[];
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

const SAMPLE_REPORT: ChangeReportItem[] = [
  {
    change_type: "modified",
    page: 1,
    paragraph: 6,
    old_text: "Monthly base salary: ₹45,000",
    new_text: "Monthly base salary: ₹40,000 (reduced by ₹5,000 / 11.1%)",
    consequence:
      "The monthly base salary is ₹5,000 lower, an 11.1% reduction. That equals ₹60,000 less gross base pay over a full year, before considering taxes or other compensation.",
    risk_level: "High",
    questions_to_ask: [
      "Is ₹40,000 the new guaranteed monthly base salary?",
      "Are any other benefits or allowances changing to offset the reduction?",
    ],
  },
  {
    change_type: "modified",
    page: 2,
    paragraph: 3,
    old_text: "Notice period: 30 days",
    new_text: "Notice period: 90 days",
    consequence:
      "The notice period has tripled. Leaving the role may require a longer transition, which could affect when you can start another job or how quickly either party can end employment.",
    risk_level: "Medium",
    questions_to_ask: [
      "Does the 90-day notice period apply equally to both parties?",
      "Can the notice period be shortened by mutual agreement?",
    ],
  },
  {
    change_type: "added",
    page: 4,
    paragraph: 2,
    old_text: "",
    new_text:
      "For 12 months after termination, the employee must not work for or provide services to a competing business.",
    consequence:
      "This adds a post-employment restriction that could limit your next work options for a year. How it applies can depend on the wording and local law, so clarify its scope before signing.",
    risk_level: "High",
    questions_to_ask: [
      "Which employers, roles, locations, and activities count as competing?",
      "Would the restriction still apply if the company ends the employment?",
    ],
  },
];

function isCompareResponse(value: unknown): value is CompareResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CompareResponse>;
  if (!Array.isArray(candidate.changes) || !Array.isArray(candidate.analyses)) {
    return false;
  }
  const validChanges = candidate.changes.every(
    (change) =>
      change &&
      ["modified", "added", "deleted"].includes(change.change_type) &&
      Number.isInteger(change.page) &&
      Number.isInteger(change.paragraph) &&
      typeof change.old_text === "string" &&
      typeof change.new_text === "string",
  );
  const validAnalyses = candidate.analyses.every(
    (analysis) =>
      analysis &&
      typeof analysis.consequence === "string" &&
      ["High", "Medium", "Low"].includes(analysis.risk_level) &&
      Array.isArray(analysis.questions_to_ask) &&
      analysis.questions_to_ask.length >= 1 &&
      analysis.questions_to_ask.length <= 2 &&
      analysis.questions_to_ask.every((question) => typeof question === "string"),
  );
  return validChanges && validAnalyses;
}

export default function Home() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [revisedFile, setRevisedFile] = useState<File | null>(null);
  const [report, setReport] = useState<ChangeReportItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState("");
  const reportRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isLoading) return;
    const comparisonTimer = window.setTimeout(() => setProcessingStep(1), 1200);
    const analysisTimer = window.setTimeout(() => setProcessingStep(2), 3000);
    return () => {
      window.clearTimeout(comparisonTimer);
      window.clearTimeout(analysisTimer);
    };
  }, [isLoading]);

  useEffect(() => {
    if (report !== null) {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [report]);

  const riskCounts = useMemo(
    () =>
      (report ?? []).reduce(
        (counts, item) => {
          counts[item.risk_level] += 1;
          return counts;
        },
        { High: 0, Medium: 0, Low: 0 },
      ),
    [report],
  );

  async function compareDocuments() {
    if (!originalFile || !revisedFile || isLoading) return;
    setError("");
    setReport(null);
    setProcessingStep(0);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("old_file", originalFile);
    formData.append("new_file", revisedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/compare`, {
        method: "POST",
        body: formData,
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const detail =
          payload && typeof payload === "object" && "detail" in payload
            ? String(payload.detail)
            : "We couldn't compare these documents. Please try again.";
        throw new Error(detail);
      }
      if (!isCompareResponse(payload)) {
        throw new Error("The comparison service returned an unexpected response.");
      }
      if (payload.changes.length !== payload.analyses.length) {
        throw new Error("The report could not be matched to the document changes.");
      }
      setReport(
        payload.changes.map((change, index) => ({
          ...change,
          ...payload.analyses[index],
        })),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while comparing the documents.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function deleteData() {
    setOriginalFile(null);
    setRevisedFile(null);
    setReport(null);
    setError("");
  }

  function tryInstantDemo() {
    setOriginalFile(null);
    setRevisedFile(null);
    setError("");
    setReport(SAMPLE_REPORT);
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-[#e7ebe7] bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <a href="#" className="flex w-fit items-center gap-2.5" aria-label="ChangeRadar home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf4ec] text-[#327449]">
              <RadarIcon className="h-7 w-7" />
            </span>
            <span className="text-[18px] font-bold tracking-[-0.04em] text-[#1f3027]">
              Change<span className="text-[#418253]">Radar</span>
            </span>
          </a>
          <div className="flex items-start gap-2.5 rounded-xl border border-[#e3ece5] bg-[#f7faf7] px-3 py-2.5 sm:max-w-[560px] sm:items-center">
            <ShieldIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-[#47845a] sm:mt-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold leading-4 text-[#345441]">Privacy-first document review</p>
              <p className="text-[10px] leading-4 text-[#718078] sm:text-[11px]">
                In-Memory Processing · Zero File Storage · Deterministic Diff + AI Reasoning
              </p>
            </div>
            <span className="ml-auto hidden h-2 w-2 shrink-0 rounded-full bg-[#57a36b] ring-4 ring-[#e8f4eb] sm:block" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <section className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#e2e9e3] bg-white px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em] text-[#587362] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#58a26b]" />
            DOCUMENT CHANGE INTELLIGENCE
          </div>
          <h1 className="text-[34px] font-semibold leading-[1.12] tracking-[-0.055em] text-[#1d2b24] sm:text-[48px]">
            Know what changed.
            <br className="hidden sm:block" /> Understand what it means.
          </h1>
          <p className="mx-auto mt-4 max-w-[610px] text-[14px] leading-6 text-[#738078] sm:text-[15px]">
            Compare two versions of a document and get a clear, evidence-backed view of
            the changes that deserve your attention.
          </p>
        </section>

        <section className="mx-auto mt-9 max-w-4xl rounded-[22px] border border-[#e5eae5] bg-white p-5 shadow-card sm:mt-10 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#26372d]">Start a comparison</p>
              <p className="mt-1 text-xs text-[#849088]">Upload both versions to reveal what’s different.</p>
            </div>
            <span className="hidden items-center gap-1.5 text-[11px] font-medium text-[#728078] sm:flex">
              <ShieldIcon className="h-4 w-4 text-[#5b8b68]" />
              Files stay in memory
            </span>
          </div>
          <div className="grid gap-x-5 sm:grid-cols-2">
            <UploadCard
              title="Original Document (PDF/DOCX)"
              step="1"
              file={originalFile}
              onFileSelected={setOriginalFile}
            />
            <UploadCard
              title="Revised Document (PDF/DOCX)"
              step="2"
              file={revisedFile}
              onFileSelected={setRevisedFile}
            />
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
          <button
            type="button"
            disabled={!originalFile || !revisedFile || isLoading}
            onClick={compareDocuments}
            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-90 ${
              originalFile && revisedFile
                ? "bg-emerald-600 shadow-[0_7px_18px_-8px_rgba(5,150,105,0.8)] hover:bg-emerald-700"
                : "bg-[#a8b8ac] shadow-none"
            }`}
          >
            {isLoading ? (
              "Processing comparison…"
            ) : (
              <>
                Compare &amp; Analyze Risks
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </button>
          {isLoading ? (
            <ProcessingStepper currentStep={processingStep} />
          ) : (
            <button
              type="button"
              onClick={tryInstantDemo}
              className="mt-2.5 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >
              <span aria-hidden="true">✨</span>
              Try Instant Demo (Sample Employment Contract)
            </button>
          )}
          <p className="mt-3 text-center text-[11px] leading-5 text-[#98a19b]">
            Only detected differences are sent for AI reasoning. Your uploaded documents aren’t stored.
          </p>
        </section>

        <HowItWorks />

        {report !== null && (
          <section
            ref={reportRef}
            className="mx-auto mt-12 max-w-4xl scroll-mt-8"
            aria-live="polite"
          >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#7e8b82]">
                  YOUR COMPARISON
                </p>
                <h2 className="text-[23px] font-semibold tracking-[-0.04em] text-[#203128] sm:text-[27px]">
                  Evidence-Backed Change Report
                </h2>
              </div>
              <button
                type="button"
                onClick={deleteData}
                className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-[#c4443d] px-3.5 text-xs font-semibold text-white transition hover:bg-[#ad352f] focus:outline-none focus:ring-4 focus:ring-red-200 sm:self-auto"
              >
                <TrashIcon className="h-4 w-4" />
                Delete My Data Now
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#e5eae5] bg-white sm:grid-cols-4">
              <div className="col-span-2 border-b border-[#edf0ed] p-4 sm:col-span-1 sm:border-b-0 sm:border-r">
                <p className="text-[11px] font-medium text-[#7d8981]">Total changes</p>
                <p className="mt-1 text-[25px] font-semibold tracking-[-0.04em] text-[#24352b]">{report.length}</p>
              </div>
              {(["High", "Medium", "Low"] as const).map((level) => (
                <div
                  key={level}
                  className="border-r border-[#edf0ed] p-4 last:border-r-0"
                >
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#7d8981]">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        level === "High" ? "bg-[#d75b51]" : level === "Medium" ? "bg-[#dda144]" : "bg-[#56a16a]"
                      }`}
                    />
                    {level} risk
                  </p>
                  <p className="mt-1 text-[25px] font-semibold tracking-[-0.04em] text-[#24352b]">
                    {riskCounts[level]}
                  </p>
                </div>
              ))}
            </div>

            {report.length ? (
              <div className="space-y-4">
                {report.map((item, index) => (
                  <ChangeCard
                    key={`${item.page}-${item.paragraph}-${index}`}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#e5eae5] bg-white px-6 py-10 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#e9f4eb] text-[#438255]">
                  <CheckIcon className="h-6 w-6" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-[#314239]">No changes found</h3>
                <p className="mt-1 text-xs text-[#849088]">These documents appear to have the same extracted text.</p>
              </div>
            )}
            <p className="mt-5 text-center text-[11px] leading-5 text-[#929c95]">
              AI explanations are informational and may not identify every consequence. Consider professional review for important decisions.
            </p>
          </section>
        )}
      </div>
      <footer className="border-t border-[#e7ebe7] bg-white/60 py-5">
        <p className="text-center text-[11px] text-[#96a099]">
          ChangeRadar <span className="px-1">·</span> Clearer changes, more confident decisions
        </p>
      </footer>
    </main>
  );
}
