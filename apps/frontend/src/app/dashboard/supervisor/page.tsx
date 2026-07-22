'use client';

import React, { useState, useMemo } from 'react';
import DashboardShell from '../../components/DashboardShell';
import {
  BarChart3, Cpu, Award, Trophy, Activity,
  CheckCircle2, Star, TrendingUp, AlertTriangle, Timer,
  Zap, Target, Shield, Medal, Flame, Users, Brain
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  level: string;
  points: number;
  badges: string[];
  completedCases: number;
  avgSlaHours: number;
  isCurrentUser: boolean;
}

interface SlaEntry {
  caseCode: string;
  campaignName: string;
  priority: string;
  status: string;
  slaHours: number;
  remainingHours: number;
  expert: string;
  breached: boolean;
}

const BADGE_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  ILK_KAMPANYA: { icon: Star, color: 'text-blue-400', label: 'İlk Kampanya' },
  HIZ_USTASI: { icon: Zap, color: 'text-amber-400', label: 'Hız Ustası' },
  DONUSUM_KRALI: { icon: Target, color: 'text-emerald-400', label: 'Dönüşüm Kralı' },
  MARATONCU: { icon: Flame, color: 'text-orange-400', label: 'Maratoncu' },
  CHURN_AVCISI: { icon: Shield, color: 'text-rose-400', label: 'Churn Avcısı' },
  UZMAN: { icon: Medal, color: 'text-purple-400', label: 'Uzman' },
};

const LEVEL_CONFIG: Record<string, { bg: string; text: string; border: string; min: number; max: number }> = {
  Platin: { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30', min: 3000, max: 5000 },
  Altın: { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30', min: 1500, max: 2999 },
  Gümüş: { bg: 'bg-slate-400/15', text: 'text-slate-300', border: 'border-slate-400/30', min: 500, max: 1499 },
  Bronz: { bg: 'bg-amber-700/15', text: 'text-amber-600', border: 'border-amber-700/30', min: 0, max: 499 },
};

function LevelProgressBar({ points, level }: { points: number; level: string }) {
  const config = LEVEL_CONFIG[level];
  if (!config) return null;
  const progress = Math.min(100, ((points - config.min) / (config.max - config.min)) * 100);
  return (
    <div className="w-full">
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full progress-bar-animated rounded-full" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between mt-1 text-[9px] text-slate-600">
        <span>{config.min}</span>
        <span>{config.max}</span>
      </div>
    </div>
  );
}

function AccuracyRing({ value, size = 100, label }: { value: number; size?: number; label: string }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 90 ? '#10B981' : value >= 80 ? '#FFC72C' : '#F43F5E';

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="score-ring" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="5" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-white">%{value}</span>
        </div>
      </div>
      <span className="text-[10px] text-slate-500 font-semibold">{label}</span>
    </div>
  );
}

export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEADERBOARD' | 'AI_ACCURACY' | 'SLA'>('OVERVIEW');

  // KPI Data
  const aiAccuracy = 88.5;
  const totalPredictions = 1420;
  const misclassifiedCount = 163;
  const activeModelVersion = 'v1.0-rf (RandomForest)';

  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, name: 'Ahmet Yılmaz', level: 'Platin', points: 3450, badges: ['ILK_KAMPANYA', 'HIZ_USTASI', 'DONUSUM_KRALI', 'CHURN_AVCISI', 'MARATONCU', 'UZMAN'], completedCases: 42, avgSlaHours: 3.2, isCurrentUser: false },
    { rank: 2, name: 'Ayşe Kaya', level: 'Altın', points: 2280, badges: ['ILK_KAMPANYA', 'HIZ_USTASI', 'DONUSUM_KRALI', 'MARATONCU'], completedCases: 31, avgSlaHours: 5.1, isCurrentUser: false },
    { rank: 3, name: 'Mehmet Demir', level: 'Gümüş', points: 1120, badges: ['ILK_KAMPANYA', 'HIZ_USTASI'], completedCases: 18, avgSlaHours: 7.8, isCurrentUser: false },
    { rank: 4, name: 'Zeynep Çelik', level: 'Gümüş', points: 780, badges: ['ILK_KAMPANYA'], completedCases: 12, avgSlaHours: 9.2, isCurrentUser: false },
    { rank: 5, name: 'Can Özdemir', level: 'Bronz', points: 345, badges: ['ILK_KAMPANYA'], completedCases: 6, avgSlaHours: 14.0, isCurrentUser: false },
  ];

  const slaData: SlaEntry[] = [
    { caseCode: 'CMP-2026-000102', campaignName: 'Churn Önleme Cihaz Fırsatı', priority: 'KRITIK', status: 'YENI', slaHours: 2, remainingHours: 1.5, expert: 'Atanmadı', breached: false },
    { caseCode: 'CMP-2026-000108', campaignName: 'VIP Tarife Yükseltme', priority: 'YUKSEK', status: 'OPTIMIZE_EDILIYOR', slaHours: 8, remainingHours: 3.2, expert: 'Ahmet Yılmaz', breached: false },
    { caseCode: 'CMP-2026-000099', campaignName: 'Pasif Abone Reaktivasyon', priority: 'ORTA', status: 'TEST_EDILIYOR', slaHours: 24, remainingHours: -2, expert: 'Mehmet Demir', breached: true },
  ];

  const categoryAccuracy = [
    { name: 'YÜKSEK DEĞER', accuracy: 92.4, correct: 416, total: 450, color: 'blue' },
    { name: 'RİSKLİ KAYIP', accuracy: 91.2, correct: 346, total: 380, color: 'rose' },
    { name: 'YENİ ABONE', accuracy: 84.0, correct: 269, total: 320, color: 'emerald' },
    { name: 'PASİF ABONE', accuracy: 82.5, correct: 223, total: 270, color: 'amber' },
  ];

  const pointsMatrix = [
    { event: 'Optimizasyon Tamamlandı', points: '+10', type: 'bonus' },
    { event: 'Hızlı Optimizasyon (< 2 saat)', points: '+5', type: 'bonus' },
    { event: 'Dönüşüm Hedefi Aşıldı', points: '+15', type: 'bonus' },
    { event: 'KRİTİK Vaka SLA İçi', points: '+15', type: 'bonus' },
    { event: 'SLA Aşımı', points: '-5', type: 'penalty' },
    { event: 'Düşük Puan (1-2 Yıldız)', points: '-3', type: 'penalty' },
  ];

  const tabs = [
    { key: 'OVERVIEW', label: 'Genel Bakış', icon: BarChart3 },
    { key: 'LEADERBOARD', label: 'Liderlik Tablosu', icon: Trophy },
    { key: 'AI_ACCURACY', label: 'AI Doğruluk', icon: Brain },
    { key: 'SLA', label: 'SLA İzleme', icon: Timer },
  ];

  return (
    <DashboardShell role="supervisor" userName="Süpervizör Paneli" userDetail="supervisor@turkcell.com.tr">
      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Süpervizör & Analitik Kontrol Paneli</h1>
            <p className="text-xs text-slate-500 mt-1">Canlı AI doğruluk metrikleri, liderlik tablosu ve SLA takibi</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 p-1 bg-slate-900/60 rounded-xl border border-white/5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? tab.key === 'LEADERBOARD' ? 'bg-turkcell-yellow text-turkcell-navy shadow-lg shadow-turkcell-yellow/20' :
                      tab.key === 'AI_ACCURACY' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' :
                      tab.key === 'SLA' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' :
                      'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'AI Model Doğruluğu', value: `%${aiAccuracy}`, sub: activeModelVersion, icon: Cpu, color: 'blue' },
            { label: 'Toplam Tahmin', value: totalPredictions.toLocaleString(), sub: `${misclassifiedCount} düzeltme`, icon: Activity, color: 'amber' },
            { label: 'Lider Uzman', value: 'Ahmet Yılmaz', sub: '3,450 Puan • Platin', icon: Trophy, color: 'purple' },
            { label: 'SLA Başarı Oranı', value: '%96.2', sub: 'Son 30 gün • 0 kritik ihlal', icon: CheckCircle2, color: 'emerald' },
            { label: 'Aktif Uzman', value: '5', sub: '3 online • 2 offline', icon: Users, color: 'cyan' },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-card rounded-2xl p-5 kpi-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{kpi.label}</span>
                <kpi.icon className={`w-4 h-4 text-${kpi.color}-400`} />
              </div>
              <div className="text-2xl font-black text-white leading-tight">{kpi.value}</div>
              <div className="text-[10px] text-slate-500 mt-1">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* === OVERVIEW TAB === */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Leaderboard */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-turkcell-yellow" />
                  <h3 className="text-lg font-bold text-white">Liderlik Tablosu</h3>
                </div>
                <button onClick={() => setActiveTab('LEADERBOARD')} className="text-[11px] text-turkcell-yellow font-semibold hover:underline">
                  Detaylı Görüntüle →
                </button>
              </div>
              <div className="space-y-3">
                {leaderboardData.slice(0, 3).map((row) => {
                  const lc = LEVEL_CONFIG[row.level];
                  return (
                    <div key={row.rank} className="flex items-center space-x-4 p-3 rounded-xl bg-slate-900/40 border border-white/[0.03]">
                      <div className="text-lg font-black text-white w-8">#{row.rank}</div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">{row.name}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${lc?.bg} ${lc?.text} border ${lc?.border}`}>{row.level}</span>
                          <span className="text-[10px] text-slate-500">{row.completedCases} vaka</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-turkcell-yellow">{row.points.toLocaleString()}</div>
                        <div className="text-[9px] text-slate-500">puan</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Points Matrix */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-turkcell-yellow" />
                <h3 className="text-lg font-bold text-white">Puanlama Matrisi (§6.1)</h3>
              </div>
              <div className="space-y-2">
                {pointsMatrix.map((pm) => (
                  <div key={pm.event} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/[0.03]">
                    <span className="text-xs text-slate-300">{pm.event}</span>
                    <span className={`text-sm font-black ${pm.type === 'bonus' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pm.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === LEADERBOARD TAB === */}
        {activeTab === 'LEADERBOARD' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-turkcell-yellow" />
              <h3 className="text-2xl font-bold text-white">Uzman Oyunlaştırma Liderlik Tablosu</h3>
            </div>

            {/* Badge Catalog */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-4 h-4 text-turkcell-yellow" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rozet Kataloğu (§6.2)</span>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(BADGE_ICONS).map(([key, badge]) => {
                  const BadgeIcon = badge.icon;
                  return (
                    <div key={key} className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.03] text-center space-y-2">
                      <BadgeIcon className={`w-6 h-6 mx-auto ${badge.color}`} />
                      <div className="text-[10px] font-bold text-slate-300">{badge.label}</div>
                      <div className="text-[8px] font-mono text-slate-600">{key}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3.5">Sıra</th>
                    <th className="px-5 py-3.5">Uzman Adı</th>
                    <th className="px-5 py-3.5">Seviye & İlerleme</th>
                    <th className="px-5 py-3.5">Rozetler</th>
                    <th className="px-5 py-3.5">Tamamlanan Vaka</th>
                    <th className="px-5 py-3.5">Ort. SLA</th>
                    <th className="px-5 py-3.5 text-right">Puan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {leaderboardData.map((row) => {
                    const lc = LEVEL_CONFIG[row.level];
                    return (
                      <tr key={row.rank} className={`table-row-hover ${row.rank === 1 ? 'bg-turkcell-yellow/[0.04]' : ''}`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-2">
                            {row.rank <= 3 && (
                              <Trophy className={`w-5 h-5 ${
                                row.rank === 1 ? 'text-amber-400 fill-amber-400' :
                                row.rank === 2 ? 'text-slate-300 fill-slate-300' :
                                'text-amber-700 fill-amber-700'
                              }`} />
                            )}
                            <span className="font-bold text-white">#{row.rank}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-white">{row.name}</td>
                        <td className="px-5 py-4">
                          <div className="space-y-1.5 max-w-[160px]">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold border ${lc?.bg} ${lc?.text} ${lc?.border}`}>
                              {row.level}
                            </span>
                            <LevelProgressBar points={row.points} level={row.level} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {row.badges.map((b) => {
                              const badge = BADGE_ICONS[b];
                              if (!badge) return null;
                              const BadgeIcon = badge.icon;
                              return (
                                <div key={b} className="p-1.5 rounded-lg bg-slate-800/60 group relative" title={badge.label}>
                                  <BadgeIcon className={`w-4 h-4 ${badge.color}`} />
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-white font-semibold">{row.completedCases}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold ${row.avgSlaHours <= 4 ? 'text-emerald-400' : row.avgSlaHours <= 8 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {row.avgSlaHours}h
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-xl font-black text-turkcell-yellow">{row.points.toLocaleString()}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Level Thresholds */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-4 h-4 text-turkcell-yellow" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seviye Eşikleri (§6.3)</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(LEVEL_CONFIG).map(([level, config]) => (
                  <div key={level} className={`p-4 rounded-xl border ${config.bg} ${config.border} text-center space-y-1`}>
                    <div className={`text-sm font-bold ${config.text}`}>{level}</div>
                    <div className="text-xs text-slate-500">{config.min.toLocaleString()} – {config.max.toLocaleString()} Puan</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === AI ACCURACY TAB === */}
        {activeTab === 'AI_ACCURACY' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">AI Model Doğruluk Metrikleri</h3>
            </div>

            {/* Main Accuracy + Category Breakdown */}
            <div className="glass-card rounded-2xl p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <AccuracyRing value={aiAccuracy} size={140} label="Genel Doğruluk" />
                <div className="flex-1 grid grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Doğru Tahmin</div>
                    <div className="text-2xl font-black text-emerald-400">{(totalPredictions - misclassifiedCount).toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Düzeltme Kaydı</div>
                    <div className="text-2xl font-black text-rose-400">{misclassifiedCount}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Model F1 Skoru</div>
                    <div className="text-2xl font-black text-turkcell-yellow">0.872</div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown (+3 Bonus) */}
              <div className="border-t border-white/5 pt-6">
                <div className="flex items-center space-x-2 mb-5">
                  <Cpu className="w-5 h-5 text-turkcell-yellow" />
                  <h4 className="text-lg font-bold text-white">Kategori Bazlı AI İsabet Oranları (+3 Bonus Puan)</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categoryAccuracy.map((cat) => (
                    <div key={cat.name} className={`glass-card rounded-2xl p-5 border-${cat.color}-500/20 text-center space-y-3`}>
                      <AccuracyRing value={cat.accuracy} size={80} label="" />
                      <div>
                        <div className={`text-xs font-bold text-${cat.color}-400`}>{cat.name}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{cat.correct} / {cat.total} doğru</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Info */}
            <div className="glass-card rounded-2xl p-5 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">Aktif Model: {activeModelVersion}</div>
                <div className="text-[11px] text-slate-500">scikit-learn RandomForest + GradientBoosting • 8 feature input • Auto-retrain: segment override sonrası</div>
              </div>
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot" />
                <span>Aktif</span>
              </span>
            </div>
          </div>
        )}

        {/* === SLA TAB === */}
        {activeTab === 'SLA' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Timer className="w-6 h-6 text-rose-400" />
              <h3 className="text-2xl font-bold text-white">SLA İzleme Paneli (§4.4)</h3>
            </div>

            {/* SLA Rules */}
            <div className="glass-card rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">SLA Kuralları</div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { priority: 'KRİTİK', hours: '2 Saat', color: 'rose', desc: 'Kırmızı işaretlenir, en üstte sabitlenir' },
                  { priority: 'YÜKSEK', hours: '8 Saat', color: 'orange', desc: 'Turuncu işaretlenir' },
                  { priority: 'ORTA', hours: '24 Saat', color: 'amber', desc: 'Görsel uyarı' },
                  { priority: 'DÜŞÜK', hours: '72 Saat', color: 'slate', desc: 'Görsel uyarı' },
                ].map((rule) => (
                  <div key={rule.priority} className={`p-4 rounded-xl bg-${rule.color}-500/10 border border-${rule.color}-500/20 space-y-1`}>
                    <div className={`text-sm font-black text-${rule.color}-400`}>{rule.priority}</div>
                    <div className="text-lg font-black text-white">{rule.hours}</div>
                    <div className="text-[10px] text-slate-500">{rule.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3.5">Vaka</th>
                    <th className="px-5 py-3.5">Kampanya</th>
                    <th className="px-5 py-3.5">Öncelik</th>
                    <th className="px-5 py-3.5">Durum</th>
                    <th className="px-5 py-3.5">SLA Süresi</th>
                    <th className="px-5 py-3.5">Kalan</th>
                    <th className="px-5 py-3.5">Uzman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {slaData.map((sla) => (
                    <tr key={sla.caseCode} className={`table-row-hover ${sla.breached ? 'bg-rose-500/5' : ''}`}>
                      <td className="px-5 py-4 font-mono text-[11px] text-turkcell-yellow font-bold">{sla.caseCode}</td>
                      <td className="px-5 py-4 text-white font-medium text-xs">{sla.campaignName}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          sla.priority === 'KRITIK' ? 'bg-rose-500/15 text-rose-400' : 'bg-orange-500/15 text-orange-400'
                        }`}>{sla.priority}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                          {sla.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-300 font-semibold">{sla.slaHours}h</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-bold ${sla.breached ? 'text-rose-400 sla-critical' : sla.remainingHours < 2 ? 'text-orange-400' : 'text-emerald-400'}`}>
                          {sla.breached ? `AŞILDI (${Math.abs(sla.remainingHours)}h)` : `${sla.remainingHours}h kaldı`}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">{sla.expert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </DashboardShell>
  );
}
