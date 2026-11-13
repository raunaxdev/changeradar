import { FileIcon, RadarIcon, SparkIcon } from "@/components/Icons";

const STEPS = [
  {
    title: "1. Zero-Retention RAM Parsing",
    description: "PDF/DOCX never touch disk",
    Icon: FileIcon,
    tint: "bg-[#edf6ef] text-[#39784d]",
  },
  {
    title: "2. Exact Diff Engine",
    description: "100% deterministic line & number tracking",
    Icon: RadarIcon,
    tint: "bg-[#eef4f1] text-[#3c7254]",
  },
  {
    title: "3. Evidence-Backed AI",
    description: "Every risk linked to exact Page & Paragraph",
    Icon: SparkIcon,
    tint: "bg-[#f0f5ef] text-[#477d55]",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto mt-5 max-w-4xl" aria-labelledby="how-it-works-title">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 id="how-it-works-title" className="text-xs font-semibold text-[#53645a]">
          How ChangeRadar Works
        </h2>
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#9aa49d]">
          A clear path from file to insight
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {STEPS.map(({ title, description, Icon, tint }) => (
          <article
            key={title}
            className="group relative overflow-hidden rounded-2xl border border-[#e5eae5] bg-white p-4 shadow-[0_8px_24px_-22px_rgba(27,52,40,0.3)] transition hover:-translate-y-0.5 hover:border-[#d3e2d6]"
          >
            <div className="pointer-events-none absolute -right-4 -top-5 h-20 w-20 rounded-full bg-[#f6faf6] transition group-hover:scale-110" />
            <span className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}>
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="relative mt-3 text-[12px] font-semibold leading-5 text-[#2e4135]">
              {title}
            </h3>
            <p className="relative mt-1 text-[11px] leading-5 text-[#7d8981]">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
