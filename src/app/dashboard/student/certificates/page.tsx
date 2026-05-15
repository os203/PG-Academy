import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Medal, ExternalLink, Calendar } from "lucide-react";
import React from "react";

export const metadata = {
  title: "My Certificates | PG Academy",
};

export default async function CertificatesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const decoded = await verifyToken(token);
  if (!decoded?.userId || decoded.role !== "STUDENT") {
    redirect("/login");
  }

  const certificates = await db.certificate.findMany({
    where: {
      userId: decoded.userId,
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
        <div className="bg-linear-to-r from-yellow-400 to-yellow-600 p-3 rounded-2xl shadow-md">
          <Medal className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">My Certificates</h1>
          <p className="text-gray-500">View and download your earned certificates</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
            <Medal className="text-gray-400 w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No certificates yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Complete your enrolled tracks by watching all lessons and passing all quizzes to earn your first certificate!
          </p>
          <Link
            href="/dashboard/myCourses"
            className="inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-primary/90 transition"
          >
            Go to My Tracks
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="h-32 bg-linear-to-r from-brand-primary to-indigo-700 p-6 flex flex-col justify-end relative overflow-hidden">
                <Medal className="absolute -top-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
                <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 z-10 relative shadow-sm">
                  {cert.track.title}
                </h3>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Certificate Code</p>
                  <p className="font-mono text-sm bg-gray-50 px-2 py-1 rounded text-gray-700 border border-gray-200 inline-block">
                    {cert.uniqueCode}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={16} />
                  <span>Issued on {new Date(cert.issuedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="pt-2">
                  <Link
                    href={`/certificates/${cert.uniqueCode}`}
                    target="_blank"
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium py-2 rounded-xl transition"
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
