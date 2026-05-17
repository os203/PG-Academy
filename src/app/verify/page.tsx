"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function VerifyCertificatePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    // Directly navigate to the certificate page. 
    // The certificate page will handle showing a 404 if it doesn't exist.
    router.push(`/certificates/${code.trim()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Link href="/" className="absolute top-6 left-6 hover:scale-105 transition-transform">
        <Image src="/logo.jpg" alt="PG Academy" width={180} height={45} className="object-contain rounded-sm" priority />
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
        <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
          <ShieldCheck className="text-green-600 w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">Verify Certificate</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Enter the unique certificate code to verify its authenticity and check the details of the credential.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. PG-CERT-A1B2C3D4"
              className="block w-full pl-11 pr-4 py-4 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition font-mono uppercase"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-primary hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Verify Credential"}
          </button>
        </form>
      </div>

      <p className="mt-8 text-sm text-gray-400">
        Secure Verification Portal &copy; {new Date().getFullYear()} PG Academy
      </p>
    </div>
  );
}
