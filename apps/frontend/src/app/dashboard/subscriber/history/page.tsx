'use client';

import React, { useState, Suspense } from 'react';
import DashboardShell from '../../../components/DashboardShell';
import {
  History, CheckCircle2, XCircle, Star, Package, Smartphone,
  Heart, Filter, Search, Calendar, ArrowUpDown
} from 'lucide-react';

// Kullanıcıya özel, kimlik doğrulamalı sayfa → statik prerender kapalı (useSearchParams CSR bailout'unu önler).
export const dynamic = 'force-dynamic';

interface HistoryItem {
  id: string;
  code: string;
  name: string;
  type: string;
  typeLabel: string;
  discountPercent: number;
  aiScore: number;
  status: 'ACCEPTED' | 'REJECTED';
  userRating?: number;
  date: string;
  reasoning: string;
}

export default function SubscriberHistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#050810]" />}>
      <SubscriberHistoryPageInner />
    </Suspense>
  );
}

function SubscriberHistoryPageInner() {
  const [filter, setFilter] = useState<'ALL' | 'ACCEPTED' | 'REJECTED'>('ALL');
  const [search, setSearch] = useState('');

  const history: HistoryItem[] = [
    {
      id: '1', code: 'CMP-2026-000087', name: '15GB Sosyal Medya Paketi',
      type: 'EK_PAKET', typeLabel: 'Ek Paket', discountPercent: 25, aiScore: 0.92,
      status: 'ACCEPTED', userRating: 5, date: '2026-07-18',
      reasoning: 'AI Analizi: Yüksek sosyal medya kullanımı tespit edildi. Instagram ve YouTube veri tüketiminiz aylık 12 GB.',
    },
    {
      id: '2', code: 'CMP-2026-000072', name: 'Aile Plus Tarife Yükseltme',
      type: 'TARIFE_YUKSELTME', typeLabel: 'Tarife Yükseltme', discountPercent: 15, aiScore: 0.78,
      status: 'REJECTED', date: '2026-07-10',
      reasoning: 'AI Analizi: Ev hattınızla birleşik aile paketi dönüşüm olasılığı yüksek.',
    },
    {
      id: '3', code: 'CMP-2026-000058', name: 'Samsung Galaxy S26 Cihaz Fırsatı',
      type: 'CIHAZ_FIRSATI', typeLabel: 'Cihaz Fırsatı', discountPercent: 35, aiScore: 0.88,
      status: 'ACCEPTED', userRating: 4, date: '2026-06-28',
      reasoning: 'AI Analizi: Cihazınız 2+ yaşında, 5G uyumlu yeni cihaz teklifi uygun görüldü.',
    },
    {
      id: '4', code: 'CMP-2026-000045', name: 'Sadakat Hediyesi — Ücretsiz 10GB',
      type: 'SADAKAT', typeLabel: 'Sadakat', discountPercent: 100, aiScore: 0.95,
      status: 'ACCEPTED', userRating: 5, date: '2026-06-15',
      reasoning: 'AI Analizi: 30+ ay sadık abone olarak ücretsiz 10GB hediye paketi hak edildi.',
    },
    {
      id: '5', code: 'CMP-2026-000032', name: 'Uluslararası Arama Paketi',
      type: 'EK_PAKET', typeLabel: 'Ek Paket', discountPercent: 20, aiScore: 0.65,
      status: 'REJECTED', date: '2026-06-05',
      reasoning: 'AI Analizi: Son 3 ayda uluslararası arama geçmişi tespit edildi.',
    },
  ];

  const filtered = history
    .filter((h) => filter === 'ALL' || h.status === filter)
    .filter((h) => search === '' || h.name.toLowerCase().includes(search.toLowerCase()));

  const typeColors: Record<string, string> = {
    EK_PAKET: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    CIHAZ_FIRSATI: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    TARIFE_YUKSELTME: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    SADAKAT: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  };

  const accepted = history.filter((h) => h.status === 'ACCEPTED').length;
  const rejected = history.filter((h) => h.status === 'REJECTED').length;
  const avgRating = history.filter((h) => h.userRating).reduce((sum, h) => sum + (h.userRating || 0), 0) / history.filter((h) => h.userRating).length;

  return (
    <DashboardShell role="subscriber" userName="Ahmet Yılmaz" userDetail="0555 111 22 33 • Yüksek Değer">
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white">Teklif Geçmişi</h1>
          <p className="text-sm text-slate-400 mt-1">Size sunulan tüm kampanya tekliflerinin ve geri bildirimlerinizin kaydı</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Toplam Teklif</div>
            <div className="text-3xl font-black text-white">{history.length}</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Kabul Edilen</div>
            <div className="text-3xl font-black text-emerald-400">{accepted}</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Reddedilen</div>
            <div className="text-3xl font-black text-rose-400">{rejected}</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Ort. Değerlendirme</div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-3xl font-black text-amber-400">{avgRating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            {(['ALL', 'ACCEPTED', 'REJECTED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f
                    ? f === 'ACCEPTED' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                      f === 'REJECTED' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20' :
                      'bg-turkcell-yellow/15 text-turkcell-yellow border border-turkcell-yellow/20'
                    : 'bg-slate-800/40 text-slate-500 border border-transparent hover:text-white'
                }`}
              >
                {f === 'ALL' ? 'Tümü' : f === 'ACCEPTED' ? 'Kabul Edilen' : 'Reddedilen'}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Teklif ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/40 rounded-xl text-white text-sm outline-none focus:border-turkcell-yellow/40 transition-all"
            />
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl p-5 transition-all duration-300">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.status === 'ACCEPTED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {item.status === 'ACCEPTED' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-[10px] text-slate-500">{item.code}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border ${typeColors[item.type]}`}>
                        {item.typeLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-[9px] font-bold border border-emerald-500/15">
                        %{item.discountPercent}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{item.reasoning}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-[9px] text-slate-500 uppercase">AI Skoru</div>
                    <div className="text-sm font-black text-turkcell-yellow">%{Math.round(item.aiScore * 100)}</div>
                  </div>
                  {item.userRating && (
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= item.userRating! ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Eşleşen teklif bulunamadı</p>
            </div>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
