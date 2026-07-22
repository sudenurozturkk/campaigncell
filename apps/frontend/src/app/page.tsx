'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles, Cpu, Award, Zap, ShieldCheck, ArrowRight,
  UserCheck, BarChart3, Database, Radio, GitBranch,
  Lock, Brain, Trophy, Target, Layers, Clock, Shield
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen hero-gradient text-slate-100 flex flex-col">
      {/* ===== HEADER ===== */}
      <header className="border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 bg-[#050810]/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-turkcell-yellow via-amber-400 to-turkcell-blue flex items-center justify-center font-black text-turkcell-navy text-lg shadow-lg shadow-turkcell-yellow/25">
              CC
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">
                Campaign<span className="text-turkcell-yellow">Cell</span>
              </span>
              <span className="block text-[9px] uppercase tracking-[0.2em] text-slate-500 font-medium">
                Turkcell CodeNight 2026 Final
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl border border-slate-700/60 text-sm font-medium text-slate-300 hover:border-turkcell-yellow/60 hover:text-turkcell-yellow transition-all duration-300"
            >
              Giriş Yap
            </Link>
            <Link
              href="/dashboard/expert"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-turkcell-blue to-blue-600 text-white text-sm font-semibold shadow-lg shadow-turkcell-blue/30 hover:shadow-turkcell-blue/50 hover:scale-[1.02] transition-all duration-300 flex items-center space-x-2"
            >
              <span>Platforma Git</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="text-center max-w-4xl mx-auto mb-20 space-y-8">
            <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-turkcell-yellow/10 border border-turkcell-yellow/20 text-turkcell-yellow text-xs font-semibold uppercase tracking-wider shimmer">
              <Sparkles className="w-4 h-4" />
              <span>Doğru Teklif • Doğru Müşteri • Doğru Zaman</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              <span className="gradient-text-hero">Yapay Zeka Destekli</span>
              <br />
              <span className="text-white">Kişiselleştirilmiş</span>
              <br />
              <span className="gradient-text-turkcell">Kampanya Platformu</span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              4 bağımsız mikroservis, scikit-learn ML motoru, event-driven oyunlaştırma ve
              katı SLA takibi ile Turkcell abonelerine en doğru fırsatı sunun.
            </p>

            <div className="flex items-center justify-center space-x-4 pt-4">
              <Link
                href="/login"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-turkcell-yellow via-amber-400 to-turkcell-gold text-turkcell-navy font-black text-base shadow-2xl shadow-turkcell-yellow/30 hover:shadow-turkcell-yellow/50 hover:scale-[1.03] transition-all duration-300 flex items-center space-x-3"
              >
                <span>Platforma Giriş Yap</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* ===== ROLE PORTALS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {/* Subscriber */}
            <Link href="/dashboard/subscriber" className="group">
              <div className="glass-card rounded-2xl p-8 h-full flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                    <UserCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Abone Portalı</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      AI tarafından kişiselleştirilmiş kampanyaları inceleyin, teklifleri kabul/ret edin,
                      XAI açıklamalarını görün ve 1-5 yıldız ile değerlendirin.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/15">AI Önerileri</span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/15">XAI Açıklama</span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/15">Yıldız Puanlama</span>
                  </div>
                </div>
                <div className="mt-8 w-full py-3.5 rounded-xl bg-slate-800/80 group-hover:bg-blue-600 text-white font-semibold text-sm transition-all duration-300 text-center flex items-center justify-center space-x-2">
                  <span>Abone Arayüzü</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Expert */}
            <Link href="/dashboard/expert" className="group">
              <div className="glass-card rounded-2xl p-8 h-full flex flex-col justify-between border-turkcell-yellow/15 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-turkcell-yellow/5 rounded-full blur-3xl" />
                <div className="space-y-5 relative">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-amber-500/20 transition-all duration-300">
                      <Cpu className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-turkcell-yellow/15 text-turkcell-yellow text-[10px] font-black uppercase tracking-wider border border-turkcell-yellow/20">
                      Ana Panel
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Kampanya Uzmanı</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Kampanya oluşturun, State Machine ile vaka yaşam döngüsünü yönetin,
                      AI segmentlerini override edin ve SLA takibi yapın.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/15">CRUD</span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/15">State Machine</span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/15">SLA Takip</span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/15">Segment Override</span>
                  </div>
                </div>
                <div className="mt-8 w-full py-3.5 rounded-xl bg-gradient-to-r from-turkcell-yellow to-amber-500 text-turkcell-navy font-black text-sm hover:opacity-90 transition-all duration-300 text-center flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20">
                  <span>Uzman Yönetim Paneli</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Supervisor */}
            <Link href="/dashboard/supervisor" className="group">
              <div className="glass-card rounded-2xl p-8 h-full flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Süpervizör & Analitik</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      AI doğruluk oranlarını ve kategori kırılımlarını takip edin, SLA ihlallerini
                      izleyin ve uzman oyunlaştırma liderlik tablosunu görüntüleyin.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-semibold border border-purple-500/15">AI Accuracy</span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-semibold border border-purple-500/15">Leaderboard</span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-semibold border border-purple-500/15">SLA İzleme</span>
                  </div>
                </div>
                <div className="mt-8 w-full py-3.5 rounded-xl bg-slate-800/80 group-hover:bg-purple-600 text-white font-semibold text-sm transition-all duration-300 text-center flex items-center justify-center space-x-2">
                  <span>Süpervizör Paneli</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* ===== ARCHITECTURE SHOWCASE ===== */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Mikroservis Mimarisi</h2>
              <p className="text-slate-400 text-base">Database-per-service izolasyonu, RabbitMQ event bus ve API Gateway tek giriş noktası</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, name: 'Identity Service', tech: 'NestJS • Prisma • JWT', port: '3001', color: 'blue' },
                { icon: Target, name: 'Campaign Service', tech: 'NestJS • State Machine • SLA', port: '3002', color: 'amber' },
                { icon: Brain, name: 'AI Service', tech: 'FastAPI • scikit-learn • XAI', port: '8000', color: 'purple' },
                { icon: Trophy, name: 'Gamification Service', tech: 'NestJS • Points • Badges', port: '3003', color: 'emerald' },
              ].map((svc) => (
                <div key={svc.name} className="glass-card rounded-2xl p-6 text-center space-y-3 group">
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-${svc.color}-500/10 border border-${svc.color}-500/20 flex items-center justify-center text-${svc.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                    <svc.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{svc.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">{svc.tech}</p>
                  </div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 text-[10px] text-slate-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
                    <span>:{svc.port}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card rounded-2xl p-5 flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">API Gateway</h5>
                  <p className="text-[11px] text-slate-500">Express • Rate Limiting • Correlation-ID • :8080</p>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">RabbitMQ Event Bus</h5>
                  <p className="text-[11px] text-slate-500">Topic Exchange • DLQ • Idempotency</p>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">4× PostgreSQL</h5>
                  <p className="text-[11px] text-slate-500">Database-per-service • Ports 5433-5436</p>
                </div>
              </div>
            </div>
          </section>

          {/* ===== FEATURE HIGHLIGHTS ===== */}
          <section className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: ShieldCheck, label: 'JWT & RBAC Auth', desc: 'Token rotation & theft protection', color: 'emerald' },
                { icon: GitBranch, label: 'State Machine', desc: '7 aşamalı vaka yaşam döngüsü', color: 'blue' },
                { icon: Clock, label: 'SLA Takibi', desc: '2h / 8h / 24h / 72h kuralları', color: 'amber' },
                { icon: Award, label: 'Oyunlaştırma', desc: 'Puan, rozet ve liderlik tablosu', color: 'purple' },
              ].map((feat) => (
                <div key={feat.label} className="glass-card rounded-xl p-5 space-y-3">
                  <feat.icon className={`w-5 h-5 text-${feat.color}-400`} />
                  <div>
                    <h5 className="text-sm font-bold text-white">{feat.label}</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-slate-500 text-xs">
            © 2026 CampaignCell — Turkcell CodeNight 2026 Final Projesi
          </p>
          <div className="flex items-center space-x-6 text-slate-500 text-xs">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Tüm Servisler Çalışıyor</span>
            </span>
            <span>Docker Compose Ready</span>
            <span>CI/CD GitHub Actions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
