'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Cpu, Award, Zap, ShieldCheck, ArrowRight, UserCheck, ShieldAlert, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-turkcell-darkBg via-[#0C1222] to-turkcell-darkBg text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-50 bg-turkcell-darkBg/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-turkcell-yellow to-turkcell-blue flex items-center justify-center font-bold text-turkcell-navy text-xl shadow-lg shadow-turkcell-yellow/20">
              CC
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Campaign<span className="text-turkcell-yellow">Cell</span></span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400">Turkcell CodeNight 2026</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-sm font-medium hover:border-turkcell-yellow hover:text-turkcell-yellow transition-all"
            >
              Giriş Yap
            </Link>
            <Link
              href="/dashboard/expert"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-turkcell-blue to-turkcell-lightBlue text-white text-sm font-semibold shadow-lg shadow-turkcell-blue/30 hover:opacity-90 transition-all flex items-center space-x-2"
            >
              <span>Platforma Git</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-turkcell-yellow/10 border border-turkcell-yellow/30 text-turkcell-yellow text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Doğru Teklif • Doğru Müşteri • Doğru Zaman</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Yapay Zeka Destekli Kişiselleştirilmiş Kampanya Platformu
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed">
            Mikroservis mimarisi, scikit-learn ML öneri motoru, event-driven oyunlaştırma sistemi ve katı SLA takip altyapısı ile Turkcell abonelerine en doğru fırsatı sunun.
          </p>
        </div>

        {/* Quick Portal Switcher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Subscriber Portal */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Abone Portalı</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Yapay zeka tarafından üretilen size özel fırsatları inceleyin, teklifleri kabul veya ret edin, puan verin.
              </p>
            </div>
            <Link
              href="/dashboard/subscriber"
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-blue-600 text-white font-medium text-sm transition-all text-center flex items-center justify-center space-x-2"
            >
              <span>Abone Arayüzü</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Expert Portal */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 border-turkcell-yellow/30 shadow-turkcell-yellow/10">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Kampanya Uzmanı</h3>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase">Popüler</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Kampanyalar oluşturun, Optimizasyon Vakalarını State Machine kurallarıyla yönetin, AI segmentlerini override edin.
              </p>
            </div>
            <Link
              href="/dashboard/expert"
              className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-turkcell-yellow to-amber-500 text-turkcell-navy font-bold text-sm hover:opacity-90 transition-all text-center flex items-center justify-center space-x-2"
            >
              <span>Uzman Yönetim Paneli</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Supervisor Portal */}
          <div className="glass-card rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Süpervizör & Analitik</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Canlı AI Doğruluk oranlarını (Accuracy %), SLA ihlal durumlarını ve Uzman Oyunlaştırma Liderlik Tablosunu takip edin.
              </p>
            </div>
            <Link
              href="/dashboard/supervisor"
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-purple-600 text-white font-medium text-sm transition-all text-center flex items-center justify-center space-x-2"
            >
              <span>Süpervizör Paneli</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-800">
          <div className="flex items-center space-x-3 text-slate-300 text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Database-per-Service</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300 text-sm">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>RabbitMQ Event Flow</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300 text-sm">
            <Cpu className="w-5 h-5 text-blue-400" />
            <span>scikit-learn ML Engine</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-300 text-sm">
            <Award className="w-5 h-5 text-purple-400" />
            <span>Idempotent Gamification</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-xs">
        <p>© 2026 CampaignCell — Turkcell CodeNight Final Projesi. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
