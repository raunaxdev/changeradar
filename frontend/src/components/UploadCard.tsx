"use client";

import { useRef, useState } from "react";
import { CheckIcon, FileIcon, UploadIcon } from "@/components/Icons";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = [".pdf", ".docx"];

type UploadCardProps = {
  title: string;
  step: string;
  file: File | null;
  onFileSelected: (file: File | null) => void;
};

async function validateFile(file: File): Promise<string | null> {
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!ACCEPTED_TYPES.includes(extension)) {
    return "Choose a PDF or DOCX file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "Files must be 10 MB or smaller.";
  }

  try {
    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    const isPdf =
      extension === ".pdf" &&
      new TextDecoder().decode(header) === "%PDF-";
    const isDocx =
      extension === ".docx" &&
      header[0] === 0x50 &&
      header[1] === 0x4b &&
      header[2] === 0x03 &&
      header[3] === 0x04;
    if (!isPdf && !isDocx) {
      return "The file content does not match its PDF or DOCX extension.";
    }
  } catch {
    return "This file could not be verified. Please choose it again.";
  }
  return null;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(file: File): string {
  return file.name.toLowerCase().endsWith(".pdf") ? "PDF" : "DOCX";
}

export function UploadCard({ title, step, file, onFileSelected }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");

  async function chooseFile(candidate?: File) {
    if (!candidate || isChecking) return;
    setIsChecking(true);
    setError("");

    try {
      const validationError = await validateFile(candidate);
      setError(validationError ?? "");
      onFileSelected(validationError ? null : candidate);
    } finally {
      setIsChecking(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeFile() {
    onFileSelected(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="flex min-w-0 flex-col">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8eee9] text-[11px] font-bold text-[#557263]">
          {step}
        </span>
        <h2 className="text-sm font-semibold text-[#273630]">{title}</h2>
      </div>
      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void chooseFile(event.dataTransfer.files[0]);
        }}
        className={`flex min-h-[204px] flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-6 text-center transition ${
          isDragging
            ? "border-[#38845a] bg-[#edf8f0]"
            : file
              ? "border-[#b6d5c0] bg-[#f7fbf8]"
              : "border-[#d5ddd7] bg-[#fbfcfb] hover:border-[#93b5a0] hover:bg-[#f7faf7]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          aria-label={`Choose ${title}`}
          onChange={(event) => void chooseFile(event.target.files?.[0])}
        />
        {file ? (
          <div className="w-full max-w-[390px]">
            <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-emerald-200 bg-white px-3 py-3 text-left shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <FileIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[#293a31]" title={file.name}>
                  {file.name}
                </p>
                <p className="mt-0.5 text-[11px] text-[#78847d]">{formatBytes(file.size)}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                <CheckIcon className="h-3.5 w-3.5" />
                Verified {fileTypeLabel(file)}
              </span>
              <button
                type="button"
                onClick={removeFile}
                aria-label={`Remove ${file.name}`}
                title="Remove file"
                className="ml-0.5 inline-flex h-7 shrink-0 items-center justify-center gap-0.5 rounded-full px-1.5 text-[11px] font-medium text-[#79867e] transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                Remove <span className="text-base leading-none">×</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 text-xs font-medium text-[#47765a] underline decoration-[#c4d9ca] underline-offset-4 hover:text-[#28643d]"
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <>
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#63806d] shadow-sm ring-1 ring-[#e8ede9]">
              {isChecking ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
              ) : (
                <UploadIcon className="h-6 w-6" />
              )}
            </span>
            <p className="text-sm font-semibold text-[#293a31]">
              {isChecking ? "Verifying file…" : "Drop your file here"}
            </p>
            <p className="mt-1 text-xs text-[#87918b]">PDF or DOCX · up to 10 MB</p>
            {!isChecking && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#397d53] transition hover:bg-[#edf6ef] focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                Browse files
              </button>
            )}
          </>
        )}
      </div>
      <p className={`mt-2 min-h-4 text-xs ${error ? "text-red-600" : "text-transparent"}`} aria-live="polite">
        {error || "No file selected"}
      </p>
    </section>
  );
}
