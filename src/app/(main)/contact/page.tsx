"use client";

import Link from "next/link";
import { ArrowLeft, Clock, MessageSquareText, ShieldCheck, Send } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-32 pb-20 relative overflow-hidden">
      {/* Background decorations matching the website's dark theme */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-brand-primary/5 blur-[120px] -z-10" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-brand-accent/5 blur-[100px] -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-muted-foreground hover:text-brand-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t("nav.backToHome")}
        </Link>

        <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-medium mb-6">
              <MessageSquareText className="w-4 h-4" />
              <span>{t("contact.badge")}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {t("contact.title")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              {t("contact.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Form Section */}
            <div className="lg:col-span-7 bg-background/40 border border-border/40 rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold mb-6">{t("contact.form.title")}</h2>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                      {t("contact.form.nameLabel")}
                    </label>
                    <input 
                      type="text" 
                      id="fullName"
                      placeholder={t("contact.form.namePlaceholder")} 
                      className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      {t("contact.form.emailLabel")}
                    </label>
                    <input 
                      type="email" 
                      id="email"
                      placeholder={t("contact.form.emailPlaceholder")} 
                      className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="inquiryType" className="text-sm font-medium text-foreground">
                    {t("contact.form.typeLabel")}
                  </label>
                  <select 
                    id="inquiryType"
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all appearance-none text-foreground"
                    defaultValue="general"
                  >
                    <option value="general" className="bg-background">{t("contact.form.typeGeneral")}</option>
                    <option value="support" className="bg-background">{t("contact.form.typeSupport")}</option>
                    <option value="billing" className="bg-background">{t("contact.form.typeBilling")}</option>
                    <option value="academic" className="bg-background">{t("contact.form.typeAcademic")}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">
                    {t("contact.form.messageLabel")}
                  </label>
                  <textarea 
                    id="message"
                    rows={5}
                    placeholder={t("contact.form.messagePlaceholder")} 
                    className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all placeholder:text-muted-foreground/50 resize-y"
                  ></textarea>
                </div>

                <button 
                  type="button" 
                  className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-accent text-white px-8 py-3.5 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                >
                  <Send className="w-4 h-4" />
                  <span>{t("contact.form.submit")}</span>
                </button>
              </form>
            </div>

            {/* Sidebar Section */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* How we handle requests */}
              <div className="bg-background/40 border border-border/40 rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-6">{t("contact.sidebar.title1")}</h3>
                <ul className="space-y-5">
                  <li className="flex gap-4">
                    <div className="shrink-0 mt-0.5">
                      <Clock className="w-5 h-5 text-brand-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t("contact.sidebar.p1")}
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <div className="shrink-0 mt-0.5">
                      <MessageSquareText className="w-5 h-5 text-brand-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t("contact.sidebar.p2")}
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <div className="shrink-0 mt-0.5">
                      <ShieldCheck className="w-5 h-5 text-brand-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t("contact.sidebar.p3")}
                    </p>
                  </li>
                </ul>
              </div>

              {/* Social Media */}
              <div className="bg-background/40 border border-border/40 rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-6">{t("contact.sidebar.title2")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 hover:bg-border/50 hover:border-brand-primary/30 transition-all group">
                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                    <span className="text-sm font-medium">Instagram</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 hover:bg-border/50 hover:border-brand-primary/30 transition-all group">
                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                    </svg>
                    <span className="text-sm font-medium">X</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 hover:bg-border/50 hover:border-brand-primary/30 transition-all group">
                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                    </svg>
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 hover:bg-border/50 hover:border-brand-primary/30 transition-all group">
                    <svg className="w-5 h-5 text-muted-foreground group-hover:text-brand-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                    </svg>
                    <span className="text-sm font-medium">LinkedIn</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
