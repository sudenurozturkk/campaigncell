'use client';

import React, { useState } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import {
  Archive, Search, Filter, CheckCircle2, Calendar,
  Tag, TrendingUp, Eye, Star, Package, Smartphone, Heart, ArrowUpDown
} from 'lucide-react';

interface ArchivedCampaign {
  id: string;
  code: string;
  name: string;
  type: string;
  typeLabel: string;
  segment: string;
  discountPercent: number;
  status: 'YAYINDA' | 'ARSIVLENDI';
  aiScore: number;
  conversionRate: number;
  totalReach: number;
  acceptedCount: number;
  avgRating: number;
  completedDate: string;
  optimizationNote: string;
}

const TYPE_COLORS: Record<string, string> = {
  EK_PAKET: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  CIHAZ_FIRSATI: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  TARIFE_YUKSELTME: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  SADAKAT: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

const STATUS_COLORS: Record<string, string> = {
  YAYINDA: 'bg-turkcell-yellow/15 text-turkcell-yellow border-turkcell-yellow/20',
  ARSIVLENDI: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

export default function ExpertArchivePage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'conversion' | 'reach'>('date');

  const campaigns: ArchivedCampaign[] = [
    {
      id: '1', code: 'CMP-2026-000098', name: 'Yüksek Değerli Abone 20GB Ek Paket',
      type: 'EK_PAKET', typeLabel: 'Ek Paket', segment: 'YUKSEK_DEGER',
      discountPercent: 30, status: 'YAYINDA', aiScore: 0.94, conversionRate: 85,
      totalReach: 1240, acceptedCount: 1054, avgRating: 4.7,
      completedDate: '2026-07-20',
      optimizationNote: 'Ekstra %5 sadakat indirimi eklendi. A/B test sonuçlarına göre dönüşüm +12% arttı.',
    },
    {
      id: '2', code: 'CMP-2026-000085', name: 'Churn Önleme Cihaz Fırsatı',
      type: 'CIHAZ_FIRSATI', typeLabel: 'Cihaz Fırsatı', segment: 'RISKLI_KAYIP',
      discountPercent: 40, status: 'YAYINDA', aiScore: 0.88, conversionRate: 72,
      totalReach: 580, acceptedCount: 418, avgRating: 4.2,
      completedDate: '2026-07-15',
      optimizationNote: 'RISKLI_KAYIP segmentine özel 5G cihaz paketi. Churn oranı %8 azaldı.',
    },
    {
      id: '3', code: 'CMP-2026-000071', name: 'Yeni Abone Hoş Geldin 10GB',
      type: 'EK_PAKET', typeLabel: 'Ek Paket', segment: 'YENI_ABONE',
      discountPercent: 100, status: 'ARSIVLENDI', aiScore: 0.91, conversionRate: 89,
      totalReach: 340, acceptedCount: 303, avgRating: 4.9,
      completedDate: '2026-07-10',
      optimizationNote: 'Ücretsiz hoş geldin paketi. Abone memnuniyeti en yüksek kampanya oldu.',
    },
    {
      id: '4', code: 'CMP-2026-000062', name: 'Aile Plus Tarife Yükseltme',
      type: 'TARIFE_YUKSELTME', typeLabel: 'Tarife Yükseltme', segment: 'YUKSEK_DEGER',
      discountPercent: 15, status: 'ARSIVLENDI', aiScore: 0.78, conversionRate: 64,
      totalReach: 890, acceptedCount: 570, avgRating: 3.8,
      completedDate: '2026-07-05',
      optimizationNote: 'Aile paketi segmenti için optimize edildi. Beklentinin altında kaldı.',
    },
    {
      id: '5', code: 'CMP-2026-000055', name: '3 Yıl Sadakat Ödülü',
      type: 'SADAKAT', typeLabel: 'Sadakat', segment: 'YUKSEK_DEGER',
      discountPercent: 100, status: 'ARSIVLENDI', aiScore: 0.96, conversionRate: 94,
      totalReach: 210, acceptedCount: 197, avgRating: 4.8,
      completedDate: '2026-06-28',
      optimizationNote: '36 ay üstü abonelere özel hediye. En yüksek dönüşüm oranı.',
    },
  ];

  const filtered = campaigns
    .filter((c) => typeFilter === 'ALL' || c.type === typeFilter)
    .filter((c) => statusFilter === 'ALL' || c.status === statusFilter)
    .filter((c) => search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search))
    .sort((a, b) => {
      if (sortBy === 'conversion') return b.conversionRate - a.conversionRate;
      if (sortBy === 'reach') return b.totalReach - a.totalReach;
      return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
    });

  const totalAccepted = campaigns.reduce((s, c) => s + c.acceptedCount, 0);
  const totalReach = campaigns.reduce((s, c) => s + c.totalReach, 0);
  const avgConversion = Math.round(campaigns.reduce((s, c) => s + c.conversionRate, 0) / campaigns.length);

  return (
    <DashboardShell role="expert" userName="Ahmet Yılmaz" userDetail="uzman@turkcell.com.tr • Altın Seviye">
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white">Kampanya Arşivi</h1>
          <p className="text-sm text-slate-400 mt-1">Tamamladığınız ve yayındaki tüm kampanyaların performans özeti</p>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Kampanya', value: campaigns.length.toString(), color: 'text-white' },
            { label: 'Toplam Erişim', value: totalReach.toLocaleString(), color: 'text-blue-400' },
            { label: 'Toplam Kabul', value: totalAccepted.toLocaleString(), color: 'text-emerald-400' },
            { label: 'Ort. Dönüşüm', value: `%${avgConversion}`, color: 'text-turkcell-yellow' },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-card rounded-2xl p-5">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">{kpi.label}</div>
              <div className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Kampanya ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/40 rounded-xl text-white text-sm outline-none focus:border-turkcell-yellow/40 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-900/60 border border-slate-700/40 rounded-xl text-white text-xs outline-none"
            >
              <option value="ALL">Tüm Türler</option>
              <option value="EK_PAKET">Ek Paket</option>
              <option value="CIHAZ_FIRSATI">Cihaz Fırsatı</option>
              <option value="TARIFE_YUKSELTME">Tarife Yükseltme</option>
              <option value="SADAKAT">Sadakat</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-900/60 border border-slate-700/40 rounded-xl text-white text-xs outline-none"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="YAYINDA">Yayında</option>
              <option value="ARSIVLENDI">Arşivlendi</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2.5 bg-slate-900/60 border border-slate-700/40 rounded-xl text-white text-xs outline-none"
            >
              <option value="date">Tarihe Göre</option>
              <option value="conversion">Dönüşüme Göre</option>
              <option value="reach">Erişime Göre</option>
            </select>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="space-y-4">
          {filtered.map((camp) => (
            <div key={camp.id} className="glass-card rounded-2xl p-6 space-y-4 transition-all duration-300">
              {/* Top Row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-[10px] text-slate-500">{camp.code}</span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${TYPE_COLORS[camp.type]}`}>
                    {camp.typeLabel}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${STATUS_COLORS[camp.status]}`}>
                    {camp.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/15">
                    %{camp.discountPercent} İndirim
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{camp.completedDate}</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white">{camp.name}</h3>
              <p className="text-xs text-slate-400 italic leading-relaxed border-l-2 border-turkcell-yellow/20 pl-3">
                {camp.optimizationNote}
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.04] text-center">
                  <div className="text-lg font-black text-turkcell-yellow">%{camp.conversionRate}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Dönüşüm</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.04] text-center">
                  <div className="text-lg font-black text-blue-400">{camp.totalReach.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Erişim</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.04] text-center">
                  <div className="text-lg font-black text-emerald-400">{camp.acceptedCount.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Kabul</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.04] text-center">
                  <div className="text-lg font-black text-purple-400">%{Math.round(camp.aiScore * 100)}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">AI Skoru</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.04] text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-lg font-black text-amber-400">{camp.avgRating}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Ort. Puan</div>
                </div>
              </div>

              {/* Conversion Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Dönüşüm Oranı</span>
                  <span className="font-bold text-white">%{camp.conversionRate}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full progress-bar-animated rounded-full transition-all duration-1000"
                    style={{ width: `${camp.conversionRate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Archive className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Eşleşen kampanya bulunamadı</p>
            </div>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
