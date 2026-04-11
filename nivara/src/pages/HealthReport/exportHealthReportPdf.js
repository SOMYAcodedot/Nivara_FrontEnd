import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Adds a tall canvas to a PDF as sequential pages by cropping unique horizontal
 * strips (no repeated full-image offsets — avoids overlap/ghosting at page breaks).
 */
function addCanvasAsSlicedPages(pdf, canvas, marginMm, innerW, innerH) {
  const imgDisplayW = innerW;
  const imgDisplayH = (canvas.height * imgDisplayW) / canvas.width;
  if (canvas.height === 0 || canvas.width === 0) return;

  const slicePxFloat = (innerH / imgDisplayH) * canvas.height;
  const slicePx = Math.max(1, Math.floor(slicePxFloat));

  const sliceCanvas = document.createElement("canvas");
  const ctx = sliceCanvas.getContext("2d");

  let yPx = 0;
  let pageNum = 0;

  while (yPx < canvas.height) {
    const remaining = canvas.height - yPx;
    const hPx = Math.min(slicePx, remaining);

    sliceCanvas.width = canvas.width;
    sliceCanvas.height = hPx;
    ctx.drawImage(canvas, 0, yPx, canvas.width, hPx, 0, 0, canvas.width, hPx);

    const sliceData = sliceCanvas.toDataURL("image/png", 1.0);
    const sliceMmH = (hPx / canvas.height) * imgDisplayH;

    if (pageNum > 0) pdf.addPage();
    pdf.addImage(sliceData, "PNG", marginMm, marginMm, imgDisplayW, sliceMmH);

    yPx += hPx;
    pageNum += 1;
  }
}

function normalizePdfRootsInClone(doc) {
  doc.querySelectorAll(".health-report-pdf-root").forEach((clone) => {
    clone.style.position = "static";
    clone.style.left = "auto";
    clone.style.top = "auto";
    clone.style.opacity = "1";
  });
}

/**
 * Rasterizes one or more DOM segments to a multi-page A4 PDF.
 * HealthReportPdfDocument returns [reportOnlyRoot, lifestyleRoot] when lifestyle exists so page 1
 * is not sliced together with lifestyle (avoids a sparse “header only” slice and a stray third page).
 */
export async function exportHealthReportPdf(
  pdfTarget,
  filename = "Nivara_Health_Report.pdf"
) {
  const segments =
    pdfTarget != null && typeof pdfTarget.getPdfExportSegments === "function"
      ? pdfTarget.getPdfExportSegments()
      : pdfTarget
        ? [pdfTarget]
        : [];

  const nodes = segments.filter(Boolean);
  if (nodes.length === 0) return;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginMm = 12;
  const innerW = pageWidth - 2 * marginMm;
  const innerH = pageHeight - 2 * marginMm;

  let firstSegment = true;
  for (const element of nodes) {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      ignoreElements: (el) => el.classList?.contains?.("no-pdf"),
      onclone: (doc) => {
        normalizePdfRootsInClone(doc);
      },
    });
    if (!firstSegment) {
      pdf.addPage();
    }
    addCanvasAsSlicedPages(pdf, canvas, marginMm, innerW, innerH);
    firstSegment = false;
  }

  pdf.save(filename);
}
