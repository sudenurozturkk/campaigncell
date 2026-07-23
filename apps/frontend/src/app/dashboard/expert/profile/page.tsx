'use client';

import React, { Suspense } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import {
  Trophy, Award, Star, Zap, Target, Shield, Medal, Flame,
  TrendingUp, CheckCircle2, Clock, BarChart3, AlertTriangle,
  Package, Brain
} from 'lucide-react';

// Kullanıcıya özel, kimlik doğrulamalı sayfa → statik prerender kapalı (useSearchParams CSR bailout'unu önler).
export const dynamic = 'force-dynamic';

const BADGE_DATA = [
  { key: 'ILK_KAMPANYA', icon: Star, color: 'blue', label: 'İlk Kampanya', desc: 'İlk kampanyayı tamamla', earned: true },
  { key: 'HIZ_USTASI', icon: Zap, color: 'amber', label: 'Hız Ustası', desc: '< 2 saat optimizasyon', earned: true },
  { key: 'DONUSUM_KRALI', icon: Target, color: 'emerald', label: 'Dönüşüm Kralı', desc: '%80+ dönüşüm oranı', earned: true },
  { key: 'MARATONCU', icon: Flame, color: 'orange', label: 'Maratoncu', desc: '20+ vaka tamamla', earned: true },
  { key: 'CHURN_AVCISI', icon: Shield, color: 'rose', label: 'Churn Avcısı', desc: '5+ churn vakası çöz', earned: false },
  { key: 'UZMAN', icon: Medal, color: 'purple', label: 'Uzman', desc: '50+ vaka tamamla', earned: false },
];

const LEVEL_CONFIG: Record<string, { bg: string; text: string; border: string; min: number; max: number }> = {
  Platin: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30', min: 3000, max: 5000 },
  Altın: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', min: 1500, max: 2999 },
  Gümüş: { bg: 'bg-slate-400/15', text: 'text-slate-300', border: 'border-slate-400/30', min: 500, max: 1499 },
  Bronz: { bg: 'bg-amber-700/15', text: 'text-amber-600', border: 'border-amber-700/30', min: 0, max: 499 },
};

function ScoreRing({ value, size = 100, color }: { value: number; size?: number; color: string }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="score-ring" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black text-white">{value}%</span>
      </div>
    </div>
  );
}

export default function ExpertProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900" />}>
      <ExpertProfilePageInner />
    </Suspense>
  );
}

function ExpertProfilePageInner() {
  const expert = {
    name: 'Ahmet Yılmaz',
    email: 'ahmet@turkcell.com.tr',
    role: 'CAMPAIGN_EXPERT',
    region: 'İstanbul',
    expertiseTags: ['Churn Önleme', 'Ek Paket', 'Tarife Yükseltme'],
    points: 2280,
    level: 'Altın',
    rank: 2,
    totalExperts: 5,
    completedCases: 31,
    activeCases: 3,
    avgSlaHours: 5.1,
    slaSuccessRate: 96,
    conversionRate: 82,
    avgRatingReceived: 4.4,
    fastOptimizations: 18,
    criticalSolved: 7,
  };

  const lc = LEVEL_CONFIG[expert.level];
  const progress = Math.min(100, ((expert.points - lc.min) / (lc.max - lc.min)) * 100);
  const nextLevel = expert.level === 'Bronz' ? 'Gümüş' : expert.level === 'Gümüş' ? 'Altın' : expert.level === 'Altın' ? 'Platin' : 'MAX';
  const pointsToNext = expert.level === 'Platin' ? 0 : lc.max - expert.points + 1;

  const recentActivity = [
    { action: 'Optimizasyon tamamlandı', points: '+10', case: 'CMP-2026-000101', time: '2 saat önce' },
    { action: 'Hızlı optimizasyon bonusu', points: '+5', case: 'CMP-2026-000101', time: '2 saat önce' },
    { action: 'Dönüşüm hedefi aşıldı', points: '+15', case: 'CMP-2026-000098', time: '1 gün önce' },
    { action: 'KRİTİK vaka SLA içi', points: '+15', case: 'CMP-2026-000095', time: '2 gün önce' },
    { action: 'Düşük puan alındı (2 yıldız)', points: '-3', case: 'CMP-2026-000090', time: '3 gün önce' },
  ];

  return (
    <DashboardShell role="expert" userName={expert.name} userDetail={`${expert.email} • ${expert.level}`}>
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Profile Header */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-turkcell-yellow/5 rounded-full blur-[120px]" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-turkcell-yellow to-amber-500 flex items-center justify-center text-turkcell-navy text-2xl font-black shadow-2xl shadow-turkcell-yellow/30">
              AY
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-black text-white">{expert.name}</h1>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${lc.bg} ${lc.text} ${lc.border}`}>
                  {expert.level} Seviye
                </span>
                <span className="px-3 py-1 rounded-lg bg-turkcell-yellow/15 text-turkcell-yellow text-[10px] font-bold border border-turkcell-yellow/20">
                  #{expert.rank} Sıra
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>{expert.email}</span>
                <span>•</span>
                <span>{expert.region}</span>
                <span>•</span>
                <div className="flex gap-1.5">
                  {expert.expertiseTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-lg bg-slate-800/60 text-[10px] text-slate-300">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-black text-turkcell-yellow">{expert.points.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">Toplam Puan</div>
              {pointsToNext > 0 && (
                <div className="text-[10px] text-slate-500">
                  <span className="text-turkcell-yellow font-bold">{pointsToNext}</span> puan → {nextLevel}
                </div>
              )}
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 max-w-xl">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold ${lc.text}`}>{expert.level}</span>
              <span className="text-xs text-slate-500">{nextLevel !== 'MAX' ? nextLevel : '🏆 Maksimum Seviye'}</span>
            </div>
            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full progress-bar-animated rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-slate-600">
              <span>{lc.min.toLocaleString()}</span>
              <span>{lc.max.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tamamlanan Vaka', value: expert.completedCases.toString(), icon: CheckCircle2, color: 'emerald' },
            { label: 'Aktif Vaka', value: expert.activeCases.toString(), icon: Package, color: 'amber' },
            { label: 'Ort. SLA Süresi', value: `${expert.avgSlaHours}h`, icon: Clock, color: 'blue' },
            { label: 'Kritik Çözülen', value: expert.criticalSolved.toString(), icon: AlertTriangle, color: 'rose' },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{kpi.label}</span>
                <kpi.icon className={`w-4 h-4 text-${kpi.color}-400`} />
              </div>
              <div className="text-3xl font-black text-white">{kpi.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Rings */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-turkcell-yellow" />
              <h3 className="text-lg font-bold text-white">Performans Metrikleri</h3>
            </div>
            <div className="flex items-center justify-around py-4">
              <ScoreRing value={expert.slaSuccessRate} size={90} color="#10B981" />
              <ScoreRing value={expert.conversionRate} size={90} color="#FFC72C" />
              <div className="text-center space-y-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                  <span className="text-2xl font-black text-white">{expert.avgRatingReceived}</span>
                </div>
                <span className="text-[10px] text-slate-500">Ort. Puan</span>
              </div>
            </div>
            <div className="flex items-center justify-around text-center text-[10px] text-slate-500">
              <span>SLA Başarı</span>
              <span>Dönüşüm Oranı</span>
              <span>Abone Puanı</span>
            </div>
          </div>

          {/* Badges */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-turkcell-yellow" />
                <h3 className="text-lg font-bold text-white">Rozetlerim</h3>
              </div>
              <span className="text-xs text-slate-500">{BADGE_DATA.filter((b) => b.earned).length}/{BADGE_DATA.length} Kazanıldı</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {BADGE_DATA.map((badge) => {
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={badge.key}
                    className={`p-4 rounded-xl border text-center space-y-2 transition-all ${
                      badge.earned
                        ? `bg-${badge.color}-500/10 border-${badge.color}-500/20`
                        : 'bg-slate-900/30 border-slate-800/40 opacity-40 grayscale'
                    }`}
                  >
                    <BadgeIcon className={`w-7 h-7 mx-auto ${badge.earned ? `text-${badge.color}-400` : 'text-slate-600'}`} />
                    <div>
                      <div className={`text-[11px] font-bold ${badge.earned ? 'text-white' : 'text-slate-600'}`}>{badge.label}</div>
                      <div className="text-[9px] text-slate-500">{badge.desc}</div>
                    </div>
                    {badge.earned && (
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[8px] font-bold">
                        ✓ Kazanıldı
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-turkcell-yellow" />
            <h3 className="text-lg font-bold text-white">Son Puan Hareketleri</h3>
          </div>
          <div className="space-y-2">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/[0.03]">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    act.points.startsWith('+') ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {act.points}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{act.action}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{act.case}</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
