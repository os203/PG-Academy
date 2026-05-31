"use client";

import { useCallback, useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface CertificateDownloadButtonProps {
  certificateId: string;
  studentName: string;
  trackTitle: string;
}

export default function CertificateDownloadButton({
  certificateId,
  studentName,
  trackTitle,
}: CertificateDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);

    try {
      const element = document.getElementById(certificateId);
      if (!element) {
        alert("Certificate element not found.");
        return;
      }

      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      // Capture the certificate element as a canvas
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Create landscape A4 PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate scaling to fit the certificate in the PDF page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);

      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image on the page
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight);

      // Clean filename
      const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
      const cleanTrack = trackTitle.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
      pdf.save(`Certificate_${cleanName}_${cleanTrack}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [certificateId, studentName, trackTitle]);

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="bg-gradient-to-r from-[#bd9759] to-[#e0a84d] text-black px-5 py-2.5 rounded-xl font-bold hover:brightness-110 transition flex items-center gap-2 shadow-lg shadow-[#bd9759]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download size={16} />
          Download PDF
        </>
      )}
    </button>
  );
}
