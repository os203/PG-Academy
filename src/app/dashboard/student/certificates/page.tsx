import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Medal, ExternalLink, Calendar } from "lucide-react";
import React from "react";

export const metadata = {
  title: "My Certificates | PG Academy",
};

export default async function CertificatesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const certificates = await db.certificate.findMany({
    where: {
      userId: userId,
    },
    include: {
      track: true,
    },
    orderBy: {
      issuedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#E5C158]/10 p-3 rounded-2xl border border-[#E5C158]/20 shadow-md">
          <Medal className="text-[#E5C158] w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">My Certificates</h1>
          <p className="text-zinc-400">View and download your earned certificates</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800 p-12 text-center shadow-sm">
          <div className="bg-zinc-800/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700/50">
            <Medal className="text-zinc-400 w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No certificates yet</h3>
          <p className="text-zinc-400 max-w-md mx-auto mb-6">
            Complete your enrolled tracks by watching all lessons and passing all quizzes to earn your first certificate!
          </p>
          <Link
            href="/dashboard/myCourses"
            className="inline-flex items-center gap-2 bg-[#E5C158] text-black px-6 py-3 rounded-xl font-bold hover:bg-[#f1d06e] transition"
          >
            Go to My Tracks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-zinc-900/60 rounded-2xl border border-zinc-800 overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-700 transition-all group relative">
              <div className="h-32 bg-linear-to-r from-[#bd9759]/30 via-[#e0a84d]/20 to-[#bd9759]/10 p-6 flex flex-col justify-end relative overflow-hidden">
                <Medal className="absolute -top-4 -right-4 w-24 h-24 text-[#E5C158]/10 rotate-12" />
                <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 z-10 relative shadow-sm">
                  {cert.track.title}
                </h3>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Certificate Code</p>
                  <p className="font-mono text-sm bg-black/40 px-2 py-1 rounded text-zinc-300 border border-zinc-800 inline-block">
                    {cert.uniqueCode}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar size={16} />
                  <span>Issued on {new Date(cert.issuedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="pt-2">
                  <Link
                    href={`/certificates/${cert.uniqueCode}`}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold py-2.5 rounded-xl transition"
                  >
                    View Certificate
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
