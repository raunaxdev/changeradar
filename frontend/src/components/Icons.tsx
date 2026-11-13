import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function RadarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path d="M16 4.5a11.5 11.5 0 1 0 11.5 11.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 10a6 6 0 1 0 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 15.8 26.5 5.5M21 5.5h5.5V11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="1.7" fill="currentColor" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="M10 2.5 16 5v4.6c0 3.7-2.5 6.3-6 7.9-3.5-1.6-6-4.2-6-7.9V5l6-2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m7.3 9.8 1.8 1.8 3.7-3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M12 15V4m0 0L8 8m4-4 4 4M5 14v4.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M13.5 3.5H6A1.5 1.5 0 0 0 4.5 5v14A1.5 1.5 0 0 0 6 20.5h12a1.5 1.5 0 0 0 1.5-1.5V9.5l-6-6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13 4v6h6M8 14h8m-8 3h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="M3.5 5.5h13m-11.5 0 .7 11h7.6l.7-11M8 5.5V3.8h4v1.7m-3 3v5m2-5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="m10 2 1.8 5.8L17.5 10l-5.7 2.2L10 18l-2.2-5.8L2 10l5.8-2.2L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path d="m4.5 10.5 3.4 3.3 7.6-7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
