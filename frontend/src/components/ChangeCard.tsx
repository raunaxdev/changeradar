import { CheckIcon, SparkIcon } from "@/components/Icons";

export type RiskLevel = "High" | "Medium" | "Low";

export type ChangeReportItem = {
  change_type: "modified" | "added" | "deleted";
  page: number;
  paragraph: number;
  old_text: string;
  new_text: string;
  consequence: string;
  risk_level: RiskLevel;
  questions_to_ask: string[];
};

const riskStyles: Record<RiskLevel, string> = {
  High: "bg-[#fff0ee] text-[#bd4338] ring-[#f7d8d4]",
  Medium: "bg-[#fff6e8] text-[#a66a13] ring-[#f2e2c6]",
  Low: "bg-[#edf6ef] text-[#39764d] ring-[#d9eadc]",
};

function TextPanel({
  title,
  text,
  type,
}: {
  title: string;
  text: string;
  type: "old" | "new";
}) {
  const emptyLabel = type === "old" ? "No previous wording" : "No replacement wording";
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            type === "old" ? "bg-[#d9695e]" : "bg-[#4c9a65]"
          }`}
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#738078]">
          {title}
        </p>
      </div>
      <div
        className={`min-h-[82px] rounded-xl border p-3.5 text-[13px] leading-6 ${
          type === "old"
            ? "border-[#f3dedb] bg-[#fff7f6] text-[#684541]"
            : "border-[#dcebe0] bg-[#f5faf6] text-[#3d5d47]"
        }`}
      >
        {text || <span className="italic text-[#969e99]">{emptyLabel}</span>}
      </div>
    </div>
  );
}

export function ChangeCard({
  item,
  index,
}: {
  item: ChangeReportItem;
  index: number;
}) {
  const changeLabel = item.change_type[0].toUpperCase() + item.change_type.slice(1);
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e5e9e5] bg-white shadow-[0_8px_24px_-22px_rgba(27,52,40,0.3)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ed] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset ${riskStyles[item.risk_level]}`}
          >
            {item.risk_level} risk
          </span>
          <span className="rounded-full bg-[#f3f5f3] px-2.5 py-1 text-[11px] font-medium text-[#68756d]">
            {changeLabel}
          </span>
          <span className="text-xs text-[#7d8981]">
            Page {item.page} <span className="px-1 text-[#bec5c0]">/</span> Paragraph {item.paragraph}
          </span>
        </div>
        <span className="text-[11px] font-medium tracking-[0.1em] text-[#a0a9a3]">
          CHANGE {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
        <TextPanel title="Original text" text={item.old_text} type="old" />
        <TextPanel title="Revised text" text={item.new_text} type="new" />
      </div>

      <div className="mx-5 mb-5 rounded-xl bg-[#f6f8f6] px-4 py-4 sm:mx-6 sm:px-5">
        <div className="mb-2 flex items-center gap-2 text-[#3b7450]">
          <SparkIcon className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-[0.11em]">What this could mean</h3>
        </div>
        <p className="text-[13px] leading-6 text-[#435149]">{item.consequence}</p>
        <div className="mt-4 border-t border-[#e7ece8] pt-3.5">
          <h4 className="mb-2.5 text-xs font-semibold text-[#435149]">Questions to ask</h4>
          <ul className="space-y-2">
            {item.questions_to_ask.map((question, questionIndex) => (
              <li key={`${questionIndex}-${question}`} className="flex items-start gap-2.5 text-[13px] leading-5 text-[#657168]">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#4c9262]" />
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
