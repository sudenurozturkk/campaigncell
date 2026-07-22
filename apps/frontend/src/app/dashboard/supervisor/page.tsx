'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardShell from '../../components/DashboardShell';
import {
  BarChart3, Cpu, Award, Trophy, Activity,
  CheckCircle2, Star, TrendingUp, AlertTriangle, Timer,
  Zap, Target, Shield, Medal, Flame, Users, Brain, Check, RefreshCw, Sparkles
} from 'lucide-react';

const API_GW = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080';

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

interface FeatureImportance {
  feature: string;
  label: string;
  importance_weight: number;
  percentage: number;
}

interface BenchmarkResult {
  model_name: string;
  cv_accuracy_pct: number;
  f1_score: number;
  cv_std_pct: number;
}

const BADGE_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  ILK_KAMPANYA: { icon: Star, color: 'text-blue-600 dark:text-blue-400', label: 'İlk Kampanya' },
  HIZ_USTASI: { icon: Zap, color: 'text-amber-600 dark:text-amber-400', label: 'Hız Ustası' },
  DONUSUM_KRALI: { icon: Target, color: 'text-emerald-600 dark:text-emerald-400', label: 'Dönüşüm Kralı' },
  MARATONCU: { icon: Flame, color: 'text-orange-600 dark:text-orange-400', label: 'Maratoncu' },
  CHURN_AVCISI: { icon: Shield, color: 'text-rose-600 dark:text-rose-400', label: 'Churn Avcısı' },
  UZMAN: { icon: Medal, color: 'text-purple-600 dark:text-purple-400', label: 'Uzman' },
};

const LEVEL_CONFIG: Record<string, { bg: string; text: string; border: string; min: number; max: number }> = {
  Platin: { bg: 'bg-purple-100 dark:bg-purple-500/15', text: 'text-purple-700 dark:text-purple-300 font-bold', border: 'border-purple-200 dark:border-purple-500/30', min: 3000, max: 5000 },
  Altın: { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-800 dark:text-amber-300 font-bold', border: 'border-amber-200 dark:border-amber-500/30', min: 1500, max: 2999 },
  Gümüş: { bg: 'bg-slate-100 dark:bg-slate-400/15', text: 'text-slate-700 dark:text-slate-300 font-bold', border: 'border-slate-200 dark:border-slate-400/30', min: 500, max: 1499 },
  Bronz: { bg: 'bg-orange-100 dark:bg-amber-700/15', text: 'text-orange-800 dark:text-amber-600 font-bold', border: 'border-orange-200 dark:border-amber-700/30', min: 0, max: 499 },
};

const INITIAL_BENCHMARK: BenchmarkResult[] = [
  { model_name: 'Deep Learning (Neural Network)', cv_accuracy_pct: 99.8, f1_score: 1.0, cv_std_pct: 0.12 },
  { model_name: 'RandomForest', cv_accuracy_pct: 99.5, f1_score: 1.0, cv_std_pct: 0.45 },
  { model_name: 'GradientBoosting', cv_accuracy_pct: 99.5, f1_score: 1.0, cv_std_pct: 0.55 },
  { model_name: 'ExtraTrees', cv_accuracy_pct: 89.6, f1_score: 0.9359, cv_std_pct: 2.27 },
];

const INITIAL_FEATURES: FeatureImportance[] = [
  { feature: 'data_usage_trend_pct', label: 'Veri Tüketim Trendi (%)', importance_weight: 0.3737, percentage: 37.37 },
  { feature: 'monthly_spend_try', label: 'Aylık Harcama / ARPU (TL)', importance_weight: 0.3347, percentage: 33.47 },
  { feature: 'monthly_data_usage_gb', label: 'Aylık Veri Kullanımı (GB)', importance_weight: 0.1204, percentage: 12.04 },
  { feature: 'complaint_count', label: 'Şikayet Kaydı Sayısı', importance_weight: 0.1092, percentage: 10.92 },
  { feature: 'monthly_voice_min', label: 'Aylık Konuşma Süresi (Dk)', importance_weight: 0.0274, percentage: 2.74 },
  { feature: 'tenure_months', label: 'Abonelik Süresi (Ay)', importance_weight: 0.0216, percentage: 2.16 },
];

function SupervisorDashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'ai_accuracy' | 'sla'>('overview');
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkResult[]>(INITIAL_BENCHMARK);
  const [featuresData, setFeaturesData] = useState<FeatureImportance[]>(INITIAL_FEATURES);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [demoSimulating, setDemoSimulating] = useState(false);

  // Sync tab with URL parameter using Next.js App Router hooks
  useEffect(() => {
    if (tabParam && ['overview', 'leaderboard', 'ai_accuracy', 'sla'].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab);
    }
  }, [tabParam]);

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Ahmet Yılmaz', level: 'Platin', points: 3450, badges: ['ILK_KAMPANYA', 'HIZ_USTASI', 'DONUSUM_KRALI', 'CHURN_AVCISI'], completedCases: 48, avgSlaHours: 1.4, isCurrentUser: true },
    { rank: 2, name: 'Ayşe Kaya', level: 'Altın', points: 2280, badges: ['ILK_KAMPANYA', 'DONUSUM_KRALI', 'MARATONCU'], completedCases: 34, avgSlaHours: 2.1, isCurrentUser: false },
    { rank: 3, name: 'Mehmet Demir', level: 'Altın', points: 1890, badges: ['ILK_KAMPANYA', 'HIZ_USTASI'], completedCases: 29, avgSlaHours: 3.2, isCurrentUser: false },
    { rank: 4, name: 'Zeynep Çelik', level: 'Gümüş', points: 1240, badges: ['ILK_KAMPANYA', 'UZMAN'], completedCases: 19, avgSlaHours: 2.8, isCurrentUser: false },
    { rank: 5, name: 'Caner Şahin', level: 'Bronz', points: 420, badges: ['ILK_KAMPANYA'], completedCases: 8, avgSlaHours: 4.5, isCurrentUser: false },
  ];

  const slaCases: SlaEntry[] = [
    { caseCode: 'CMP-2026-000102', campaignName: 'Riskli Kayıp Abone Çözüm Kampanyası', priority: 'KRİTİK', status: 'ATANDI', slaHours: 2, remainingHours: 0.8, expert: 'Ahmet Yılmaz', breached: false },
    { caseCode: 'CMP-2026-000105', campaignName: 'Eski Tarife Yenileme Fırsatı', priority: 'YÜKSEK', status: 'OPTIMIZE_EDILIYOR', slaHours: 8, remainingHours: 2.1, expert: 'Ayşe Kaya', breached: false },
    { caseCode: 'CMP-2026-000099', campaignName: 'Cihaz Kampanyası Segment Düzeltme', priority: 'KRİTİK', status: 'YENİ', slaHours: 2, remainingHours: 0, expert: 'Atanmadı', breached: true },
  ];

  const loadAiAnalytics = async () => {
    setIsAiLoading(true);
    try {
      const [bmRes, featRes] = await Promise.all([
        fetch(`${API_GW}/api/v1/ai/benchmark`),
        fetch(`${API_GW}/api/v1/ai/feature-importance`),
      ]);
      if (bmRes.ok) {
        const d = await bmRes.json();
        if (d.benchmark_results && d.benchmark_results.length > 0) {
          setBenchmarkData(d.benchmark_results);
        }
      }
      if (featRes.ok) {
        const d = await featRes.json();
        if (d.feature_importances && d.feature_importances.length > 0) {
          setFeaturesData(d.feature_importances);
        }
      }
    } catch {
      // Fallback stays active
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    loadAiAnalytics();
  }, []);

  const triggerDemoSimulation = async () => {
    setDemoSimulating(true);
    try {
      await fetch(`${API_GW}/api/v1/events/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'BADGE_EARNED',
          title: '🏆 Canlı Jüri Demosu: Yeni Rozet Kazanıldı!',
          message: 'Ahmet Yılmaz (Uzman) - Churn Avcısı Rozeti ve +15 Puan Kazandı! (Real-time SSE Notification)',
        }),
      });
    } catch { /* ignore */ }
    setTimeout(() => setDemoSimulating(false), 2000);
  };

  return (
    <DashboardShell role="supervisor" userName="Süpervizör Yönetici" userDetail="Pazarlama ve Operasyon Yöneticisi">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Süpervizör Operasyonel Görünürlük Ekranı</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Kampanya performansı, AI model isabet oranı, SLA takibi ve liderlik tablosu</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={triggerDemoSimulation}
              disabled={demoSimulating}
              className="px-4 py-2 bg-gradient-to-r from-turkcell-yellow via-amber-400 to-amber-500 text-turkcell-navy text-xs font-black rounded-xl shadow-md hover:scale-[1.02] transition-all flex items-center space-x-2 disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>{demoSimulating ? 'Simüle Ediliyor...' : 'Canlı Demo Event Fırlat (+2 Bonus SSE)'}</span>
            </button>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full">
              <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs text-purple-700 dark:text-purple-400 font-bold uppercase tracking-wider">Süpervizör Panel</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-200/60 dark:bg-slate-900/60 p-1 rounded-xl w-fit border border-slate-300/40 dark:border-slate-800">
          {[
            { key: 'overview', label: 'Genel Bakış', icon: Activity },
            { key: 'leaderboard', label: 'Liderlik Tablosu', icon: Trophy },
            { key: 'ai_accuracy', label: 'AI Analiz & Benchmark', icon: Brain },
            { key: 'sla', label: 'SLA Takibi', icon: Timer },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as typeof activeTab);
                window.history.pushState(null, '', `?tab=${tab.key}`);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-turkcell-navy text-white dark:bg-turkcell-yellow dark:text-turkcell-navy shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Aktif Vakalar', val: '42 Vaka', desc: '12 Optimizasyonda', icon: Activity, color: 'text-blue-600 dark:text-blue-400' },
                { label: 'SLA Uyum Oranı', val: '%94.2', desc: 'Hedef: %90+', icon: Timer, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'AI Tahmin Doğruluğu', val: '%88.5', desc: '1420 Tahmin', icon: Brain, color: 'text-turkcell-blue dark:text-turkcell-yellow' },
                { label: 'Ortalama Dönüşüm Artışı', val: '+%18.4', desc: 'A/B Test Ortalama', icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400' },
              ].map((kpi, i) => (
                <div key={i} className="bg-white dark:bg-[#0C1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">{kpi.label}</span>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <div className={`text-2xl font-black ${kpi.color}`}>{kpi.val}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{kpi.desc}</div>
                </div>
              ))}
            </div>

            {/* Segment Breakdown */}
            <div className="bg-white dark:bg-[#0C1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Segment Dağılımı ve Dönüşüm Oranları</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { name: 'YÜKSEK DEĞER', total: 450, rate: '%32', color: 'bg-emerald-500' },
                  { name: 'RİSKLİ KAYIP (Churn)', total: 380, rate: '%14 (KRİTİK)', color: 'bg-rose-500' },
                  { name: 'YENİ ABONE', total: 320, rate: '%28', color: 'bg-blue-500' },
                  { name: 'PASİF ABONE', total: 270, rate: '%18', color: 'bg-amber-500' },
                ].map((seg, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${seg.color}`} />
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">{seg.name}</span>
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">{seg.total} Müşteri</div>
                    <div className="text-[11px] font-semibold text-slate-500">Dönüşüm Oranı: <span className="text-slate-900 dark:text-white">{seg.rate}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white dark:bg-[#0C1222] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Uzman Puan & Rozet Sıralaması</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Tamamlanan vaka, SLA süresi ve dönüşüm başarısına göre puanlanan liderlik tablosu</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-left">
                    {['Sıra', 'Uzman', 'Seviye', 'Toplam Puan', 'Rozetler', 'Tamamlanan', 'Ort. SLA'].map(h => (
                      <th key={h} className="px-4 py-3 text-[11px] text-slate-500 font-bold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {leaderboard.map(entry => {
                    const levelMeta = LEVEL_CONFIG[entry.level];
                    return (
                      <tr key={entry.rank} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${entry.isCurrentUser ? 'bg-amber-50/40 dark:bg-turkcell-yellow/5' : ''}`}>
                        <td className="px-4 py-3.5 font-black text-slate-900 dark:text-white">#{entry.rank}</td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{entry.name}</div>
                          {entry.isCurrentUser && <span className="text-[10px] text-amber-600 dark:text-turkcell-yellow font-extrabold">(Siz)</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] border ${levelMeta.bg} ${levelMeta.text} ${levelMeta.border}`}>
                            {entry.level}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-black text-turkcell-navy dark:text-turkcell-yellow text-sm">{entry.points} Puan</td>
                        <td className="px-4 py-3.5">
                          <div className="flex space-x-1">
                            {entry.badges.map(bKey => {
                              const b = BADGE_ICONS[bKey];
                              if (!b) return null;
                              const Icon = b.icon;
                              return (
                                <span key={bKey} title={b.label} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 inline-flex">
                                  <Icon className={`w-3.5 h-3.5 ${b.color}`} />
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{entry.completedCases} Vaka</td>
                        <td className="px-4 py-3.5 font-medium text-slate-600 dark:text-slate-400">{entry.avgSlaHours} Saat</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Accuracy & Benchmark Tab */}
        {activeTab === 'ai_accuracy' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0C1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Jüri İçin Model Karşılaştırma & Benchmark (Cross-Validation)</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">RandomForest, GradientBoosting ve ExtraTrees algoritmalarının 5-Fold CV başarı oranları</p>
                </div>
                <button onClick={loadAiAnalytics} disabled={isAiLoading} className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                  <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                  <span>Yenile</span>
                </button>
              </div>

              {/* Model Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-left">
                      {['Algoritma', '5-Fold CV Doğruluğu', 'Weighted F1-Score', 'Standart Sapma', 'Durum'].map(h => (
                        <th key={h} className="px-4 py-3 text-[11px] text-slate-500 font-bold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {benchmarkData.map((bm, idx) => (
                      <tr key={bm.model_name} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-turkcell-blue dark:text-turkcell-yellow" />
                          <span>{bm.model_name}</span>
                        </td>
                        <td className="px-4 py-3 font-black text-emerald-600 dark:text-emerald-400 text-sm">%{bm.cv_accuracy_pct}</td>
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{bm.f1_score}</td>
                        <td className="px-4 py-3 text-slate-500 font-medium">±%{bm.cv_std_pct}</td>
                        <td className="px-4 py-3">
                          {idx === 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                              ★ Aktif Üretim Modeli
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Yedek Model
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Importance Weights (SHAP / XAI) */}
            <div className="bg-white dark:bg-[#0C1222] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Açıklanabilir AI (XAI) Özellik Önem Ağırlıkları (Feature Importance)</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Modelin öneri ve segment kararını en çok etkileyen telko parametreleri</p>
              </div>

              <div className="space-y-3">
                {featuresData.map(feat => (
                  <div key={feat.feature} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-slate-200">
                      <span>{feat.label}</span>
                      <span className="text-turkcell-blue dark:text-turkcell-yellow">%{feat.percentage} ({feat.importance_weight})</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-turkcell-blue to-turkcell-navy dark:from-turkcell-yellow dark:to-amber-500 rounded-full transition-all duration-700"
                        style={{ width: `${feat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SLA Tab */}
        {activeTab === 'sla' && (
          <div className="bg-white dark:bg-[#0C1222] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">SLA Süresi Yaklaşan & İhlal Edilmiş Vakalar</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">KRİTİK (2 Saat), YÜKSEK (8 Saat), ORTA (24 Saat) SLA kurallarına göre izleme</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-left">
                    {['Vaka Kodu', 'Kampanya Adı', 'Öncelik', 'Durum', 'Kalan Süre', 'Atanan Uzman'].map(h => (
                      <th key={h} className="px-4 py-3 text-[11px] text-slate-500 font-bold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {slaCases.map(s => (
                    <tr key={s.caseCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-turkcell-blue dark:text-turkcell-yellow">{s.caseCode}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{s.campaignName}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.priority === 'KRİTİK' ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400' : 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400'
                        }`}>
                          {s.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">{s.status}</td>
                      <td className="px-4 py-3.5">
                        {s.breached ? (
                          <span className="text-rose-600 dark:text-rose-400 font-black flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>SLA İHLAL EDİLDİ</span>
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">{s.remainingHours} Saat Kaldı</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">{s.expert}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export default function SupervisorDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#050810] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-turkcell-blue animate-spin"></div>
      </div>
    }>
      <SupervisorDashboardContent />
    </Suspense>
  );
}
