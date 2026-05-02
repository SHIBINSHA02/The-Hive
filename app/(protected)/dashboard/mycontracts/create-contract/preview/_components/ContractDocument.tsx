import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";

/* ================= CONFIG ================= */
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const HEADER = 120;
const FOOTER = 60;
const PADDING_X = 80;

const CONTENT_HEIGHT = A4_HEIGHT - HEADER - FOOTER;

/* ================= COMPONENT ================= */
export function ContractDocument({
  formData,
  template,
  fullContractText,
  refId,
}: any) {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);

  /* ================= SCALE ================= */
  const updateScale = useCallback(() => {
    if (!containerRef.current) return;

    // We measure the container itself (which will have a % width from Tailwind)
    const containerWidth = containerRef.current.clientWidth;

    // To prevent the doc from getting too huge on 4k screens, we can still cap it 
    // but the user wants % width, so we'll calculate scale based on actual width.
    const newScale = containerWidth / A4_WIDTH;

    setScale(newScale);
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [updateScale]);

  /* ================= REAL PAGINATION ================= */
  const paginate = useCallback(() => {
    if (!fullContractText) return;

    const words = fullContractText.split(" ");
    let current = "";
    let result: string[] = [];

    const temp = document.createElement("div");
    temp.style.position = "absolute";
    temp.style.visibility = "hidden";
    temp.style.width = `${A4_WIDTH - PADDING_X * 2}px`;
    temp.style.fontFamily = "Georgia, serif";
    temp.style.fontSize = "14px";
    temp.style.lineHeight = "28px"; // Matches leading-7 (1.75rem = 28px)
    temp.style.whiteSpace = "pre-wrap"; // CRITICAL: Account for newlines
    temp.style.textAlign = "justify";

    document.body.appendChild(temp);

    let isFirstPage = true;
    for (let word of words) {
      const test = current + word + " ";
      
      // On first page, we account for title height (approx 80px)
      const allowedHeight = isFirstPage ? CONTENT_HEIGHT - 100 : CONTENT_HEIGHT;
      
      temp.innerText = test;

      if (temp.scrollHeight > allowedHeight) {
        result.push(current);
        current = word + " ";
        isFirstPage = false;
      } else {
        current = test;
      }
    }

    if (current) result.push(current);

    document.body.removeChild(temp);

    setPages(result);
    setCurrentPage((prev) => Math.min(prev, result.length));
  }, [fullContractText]);

  useEffect(() => {
    paginate();
  }, [paginate]);

  const totalPages = pages.length;

  /* ================= NAVIGATION ================= */
  const prev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const next = () =>
    setCurrentPage((p) => Math.min(totalPages, p + 1));

  /* ================= RENDER ================= */
  return (
    <div
      className="flex flex-col items-center gap-6 pb-20"
    >
      {/* CONTROLS */}
      <div className="flex items-center gap-4 bg-slate-900 px-5 py-2 rounded-full text-white mt-4 relative z-20 shadow-xl">
        <button onClick={prev} disabled={currentPage === 1}>
          <ChevronLeft />
        </button>

        <span className="text-xs font-bold">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={next}
          disabled={currentPage === totalPages}
        >
          <ChevronRight />
        </button>

        <button onClick={() => window.print()}>
          <Printer />
        </button>
      </div>

      {/* PAGE WRAPPER - Uses percentage width via Tailwind */}
      <div
        ref={containerRef}
        className="w-[95%] sm:w-[90%] lg:w-[85%] max-w-[850px] aspect-[1/1.4142] bg-white shadow-2xl border border-slate-200 rounded-sm overflow-hidden"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            width: A4_WIDTH,
            height: A4_HEIGHT,
          }}
          className="relative origin-top transition-transform duration-200 ease-out"
        >
          <div className="bg-white border shadow-xl w-full h-full relative">
            {/* HEADER */}
            <div
              className="absolute top-0 w-full border-b px-8 flex justify-between items-center"
              style={{ height: HEADER }}
            >
              <span className="text-xs text-gray-500">
                REF: {refId}
              </span>
              <span className="text-xs font-bold">
                Page {currentPage}
              </span>
            </div>

            {/* CONTENT */}
            <div
              className="absolute w-full"
              style={{
                top: HEADER,
                height: CONTENT_HEIGHT,
                padding: `0 ${PADDING_X}px`,
              }}
            >
              <PageBody
                text={pages[currentPage - 1] || ""}
                isFirst={currentPage === 1}
                isLast={currentPage === totalPages}
                template={template}
                formData={formData}
              />
            </div>

            {/* FOOTER */}
            <div
              className="absolute bottom-0 w-full border-t px-8 flex justify-between items-center"
              style={{ height: FOOTER }}
            >
              <span className="text-xs">
                {formData?.PARTY_A_NAME}
              </span>
              <span className="text-xs font-bold">
                {currentPage} / {totalPages}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= BODY ================= */
function PageBody({
  text,
  isFirst,
  isLast,
  template,
  formData,
}: any) {
  return (
    <div className="font-serif text-sm text-slate-800">
      {/* TITLE */}
      {isFirst && (
        <h1 className="text-xl text-center mb-8 border-b pb-4">
          {template?.templateConfig?.name ||
            "Contract Agreement"}
        </h1>
      )}

      {/* TEXT */}
      <p className="leading-7 whitespace-pre-wrap break-words text-justify">
        {text}
      </p>

      {/* SIGNATURE ONLY LAST PAGE */}
      {isLast && (
        <div className="mt-16 grid grid-cols-2 gap-10">
          <SignatureBlock
            label="Party A"
            name={formData?.PARTY_A_NAME}
          />
          <SignatureBlock
            label="Party B"
            name={formData?.PARTY_B_NAME}
          />
        </div>
      )}
    </div>
  );
}

/* ================= SIGNATURE ================= */
function SignatureBlock({ label, name }: any) {
  return (
    <div>
      <div className="border-t mt-10 pt-2">
        <p className="text-xs font-bold">{label}</p>
        <p className="text-xs text-gray-500">
          {name || "Sign here"}
        </p>
      </div>
    </div>
  );
}