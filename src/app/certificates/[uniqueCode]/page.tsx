import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, ShieldCheck, Award, Star } from "lucide-react";
import React from "react";
import CertificateDownloadButton from "@/components/CertificateDownloadButton";
import QRCode from "qrcode";

export async function generateMetadata({ params }: { params: Promise<{ uniqueCode: string }> }) {
  const { uniqueCode } = await params;
  const certificate = await db.certificate.findUnique({
    where: { uniqueCode },
    include: { user: true, track: true },
  });
  return {
    title: certificate
      ? `${certificate.user.name} — ${certificate.track.title} | PG Academy Certificate`
      : `Certificate ${uniqueCode} | PG Academy`,
  };
}

export default async function CertificateViewPage({
  params,
}: {
  params: Promise<{ uniqueCode: string }>;
}) {
  const { uniqueCode } = await params;

  const certificate = await db.certificate.findUnique({
    where: { uniqueCode },
    include: {
      user: true,
      track: {
        include: {
          instructor: true,
          _count: { select: { phases: true, enrollments: true } },
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Generate QR code as data URL
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://pg-academy.com"}/certificates/${uniqueCode}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 120,
    margin: 1,
    color: {
      dark: "#1a1a1a",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col">
      {/* Header */}
      <header className="bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-zinc-800/60 py-4 px-6 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="hover:scale-105 transition-transform">
          <Image src="/logo.jpg" alt="PG Academy" width={160} height={40} className="object-contain rounded-sm" priority />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/verify"
            className="text-sm font-medium text-zinc-400 hover:text-white transition flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800/50"
          >
            <ShieldCheck size={16} />
            Verify Another
          </Link>
          <CertificateDownloadButton
            certificateId="certificate-card"
            studentName={certificate.user.name}
            trackTitle={certificate.track.title}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-5xl relative">
          {/* Certificate Card */}
          <div id="certificate-card" className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">

            {/* Decorative top gold bar */}
            <div className="h-2 bg-linear-to-r from-[#bd9759] via-[#e0a84d] to-[#bd9759]" />

            {/* Corner Ornaments */}
            <div className="absolute top-6 left-6 w-20 h-20 border-t-2 border-l-2 border-[#bd9759]/40 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-6 right-6 w-20 h-20 border-t-2 border-r-2 border-[#bd9759]/40 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-24 left-6 w-20 h-20 border-b-2 border-l-2 border-[#bd9759]/40 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-24 right-6 w-20 h-20 border-b-2 border-r-2 border-[#bd9759]/40 rounded-br-xl pointer-events-none" />

            {/* Background Glow Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#bd9759]/4 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#bd9759]/3 rounded-full blur-3xl pointer-events-none" />

            {/* Certificate Content */}
            <div className="px-12 sm:px-20 py-16 sm:py-20 text-center relative z-10">

              {/* Logo & Verification Badge */}
              <div className="flex flex-col items-center gap-6 mb-10">
                <Image src="/logo.jpg" alt="PG Academy" width={120} height={30} className="object-contain rounded-sm" />
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-200">
                  <CheckCircle size={16} className="text-emerald-600" />
                  Verified Certificate
                </div>
              </div>

              {/* Stars Decoration */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Star size={14} className="text-[#bd9759]/40" />
                <Star size={18} className="text-[#bd9759]/60" />
                <Award size={32} className="text-[#bd9759]" />
                <Star size={18} className="text-[#bd9759]/60" />
                <Star size={14} className="text-[#bd9759]/40" />
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-6xl font-black text-gray-900 mb-2 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                Certificate of Completion
              </h1>
              <div className="w-32 h-1 bg-linear-to-r from-transparent via-[#bd9759] to-transparent mx-auto mb-10" />

              {/* Certify Statement */}
              <p className="text-gray-500 text-lg mb-8">
                This is to proudly certify that
              </p>

              {/* Student Name */}
              <div className="relative inline-block mb-8">
                <h2 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-[#bd9759] via-[#e0a84d] to-[#bd9759] bg-clip-text text-transparent capitalize tracking-wide" style={{ fontFamily: "'Georgia', serif" }}>
                  {certificate.user.name}
                </h2>
                <div className="mt-3 w-full h-px bg-linear-to-r from-transparent via-[#bd9759]/60 to-transparent" />
              </div>

              {/* Completion Statement */}
              <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-6">
                has successfully completed all requirements, lessons, and assessments for the track
              </p>

              {/* Track Title */}
              <div className="mb-16">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 max-w-3xl mx-auto leading-tight mb-3">
                  {certificate.track.title}
                </h3>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                  <span>{certificate.track._count.phases} Phase{certificate.track._count.phases !== 1 ? "s" : ""}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{certificate.track._count.enrollments} Student{certificate.track._count.enrollments !== 1 ? "s" : ""} Enrolled</span>
                </div>
              </div>

              {/* Signature Row */}
              <div className="flex flex-col sm:flex-row items-end justify-between w-full max-w-3xl mx-auto gap-12 sm:gap-0">
                {/* Date */}
                <div className="text-center w-full sm:w-auto">
                  <div className="text-xl font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-300 px-10" style={{ fontFamily: "'Georgia', serif" }}>
                    {issuedDate}
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-semibold">
                    Date of Issue
                  </p>
                </div>

                {/* Seal */}
                <div className="hidden sm:flex flex-col items-center -mb-2">
                  <div className="w-20 h-20 rounded-full border-2 border-[#bd9759]/40 flex items-center justify-center bg-[#bd9759]/10">
                    <Award className="w-10 h-10 text-[#bd9759]" />
                  </div>
                </div>

                {/* Instructor */}
                <div className="text-center w-full sm:w-auto">
                  <div className="text-2xl text-gray-800 mb-2 pb-2 border-b border-gray-300 px-10 capitalize" style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}>
                    {certificate.track.instructor.name}
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-semibold">
                    Instructor
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Verification Strip */}
            <div className="bg-gray-50 border-t border-gray-200 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Verification Code</span>
                </div>
                <span className="font-mono text-sm text-[#8b6914] bg-[#bd9759]/10 px-3 py-1.5 rounded-lg border border-[#bd9759]/25 font-bold tracking-wider">
                  {certificate.uniqueCode}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Scan to verify</p>
                  <p className="text-[#8b6914] font-semibold text-sm">PG Academy</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="Verify certificate QR code"
                  width={64}
                  height={64}
                  className="rounded-lg border border-gray-200 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
