import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, ShieldCheck } from "lucide-react";
import React from "react";

export async function generateMetadata({ params }: { params: Promise<{ uniqueCode: string }> }) {
  const { uniqueCode } = await params;
  return {
    title: `Certificate ${uniqueCode} | PG Academy`,
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
      course: {
        include: {
          instructor: true,
        },
      },
    },
  });

  if (!certificate) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <Link href="/" className="font-black text-2xl tracking-tighter text-brand-primary">
          PG Academy<span className="text-brand-secondary">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/verify"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition flex items-center gap-2"
          >
            <ShieldCheck size={16} />
            Verify Another
          </Link>
          <button 
            // We use standard window.print() for simplicity
            className="bg-brand-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-primary/90 transition flex items-center gap-2"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none relative border border-gray-100">
          {/* Certificate Border Details */}
          <div className="absolute inset-0 border-16 border-brand-primary/5 pointer-events-none print:border-brand-primary/20"></div>
          <div className="absolute inset-4 border-2 border-dashed border-brand-primary/20 pointer-events-none"></div>

          <div className="p-12 sm:p-24 text-center relative z-10 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-blue-50/50 via-white to-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 font-medium text-sm mb-12 border border-green-200">
              <CheckCircle size={16} className="text-green-600" />
              Verified Certificate
            </div>

            <h1 className="text-5xl sm:text-6xl font-black text-gray-900 mb-6 tracking-tight font-serif">
              Certificate of Completion
            </h1>

            <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto mb-12">
              This is to proudly certify that
            </p>

            <h2 className="text-4xl sm:text-5xl font-bold text-brand-primary mb-12 capitalize border-b-2 border-brand-primary/20 pb-4 inline-block px-12">
              {certificate.user.name}
            </h2>

            <p className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto mb-6">
              has successfully completed all requirements, lessons, and assessments for the course
            </p>

            <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-20 max-w-4xl mx-auto leading-tight">
              {certificate.course.title}
            </h3>

            <div className="flex flex-col sm:flex-row items-end justify-between w-full max-w-4xl mx-auto gap-12 sm:gap-0 mt-12">
              <div className="text-center w-full sm:w-auto">
                <div className="font-serif text-2xl font-bold text-gray-800 border-b border-gray-300 pb-2 px-8 mb-2">
                  {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">
                  Date of Issue
                </p>
              </div>

              <div className="text-center w-full sm:w-auto">
                {/* A generic signature or instructor name */}
                <div className="font-serif text-3xl text-gray-800 border-b border-gray-300 pb-2 px-8 mb-2 capitalize" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                  {certificate.course.instructor.name}
                </div>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">
                  Instructor Signature
                </p>
              </div>
            </div>

            {/* Bottom Verification Strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between text-left">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Verification Code
                </p>
                <p className="text-sm font-mono text-gray-700 bg-white px-3 py-1 rounded border border-gray-200">
                  {certificate.uniqueCode}
                </p>
              </div>
              <div className="mt-4 sm:mt-0 text-right">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  Verify at
                </p>
                <p className="text-sm font-medium text-brand-primary">
                  pg-academy.com/verify
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Script to trigger print automatically if a specific query param is present? Or just let the user click */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.querySelector('button')?.addEventListener('click', () => {
              window.print();
            });
          `,
        }}
      />
    </div>
  );
}
