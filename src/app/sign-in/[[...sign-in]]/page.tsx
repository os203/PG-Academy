import { SignIn } from "@clerk/nextjs";
import AuthLayout from "@/components/layout/AuthLayout";

export default function SignInPage() {
  return (
    <AuthLayout>
      <div className="flex flex-col justify-center items-center h-full py-12 px-4 sm:px-6 lg:px-8">
        <SignIn appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "bg-zinc-900 border border-zinc-800 shadow-xl rounded-xl",
            headerTitle: "text-white",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton: "border-zinc-700 hover:bg-zinc-800 text-zinc-300",
            dividerLine: "bg-zinc-800",
            dividerText: "text-zinc-500",
            formFieldLabel: "text-zinc-300",
            formFieldInput: "bg-zinc-950 border-zinc-800 text-white focus:border-[#bd9759] focus:ring-[#bd9759]",
            formButtonPrimary: "bg-[#bd9759] hover:bg-[#a6844b] text-white",
            footerActionText: "text-zinc-400",
            footerActionLink: "text-[#bd9759] hover:text-[#a6844b]",
          },
          layout: {
            socialButtonsPlacement: "top",
          }
        }} fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard" />
      </div>
    </AuthLayout>
  );
}
