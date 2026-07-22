'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BarChart3, Cpu, Award, ShieldAlert, ArrowLeft, Trophy, Activity, CheckCircle2, Flame, Star } from 'lucide-react';

export default function SupervisorDashboard() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LEADERBOARD' | 'AI_ACCURACY'>('OVERVIEW');

  // Simulated Analytics Data
  const aiAccuracy = 88.5;
  const totalPredictions = 1420;
  const misclassifiedCount = 163;
  const activeModelVersion = 'v1.0-rf';

  const leaderboardData = [
    { rank: 1, name: 'Ahmet Yılmaz', level: 'Platin', points: 345, badges: 4, isCurrentUser: true },
    { rank: 2, name: 'Ayşe Kaya', level: 'Altın', points: 280, badges: 3, isCurrentUser: false },
    { rank: 3, name: 'Mehmet Demir', level: 'Gümüş', points: 120, badges: 2, isCurrentUser: false },
    { rank: 4, name: 'Zeynep Çelik', level: 'Bronz', points: 45, badges: 1, isCurrentUser: false },
  ];

  return (
    <div className="min-h-screen bg-turkcell-darkBg text-slate-100 pb-16">
      {/* Header */}
      <header className="border-b border-slate-800 bg-turkcell-darkBg/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-lg">CampaignCell</span>
              <span className="px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">
                Süpervizör & Analitik
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'OVERVIEW' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('LEADERBOARD')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'LEADERBOARD' ? 'bg-turkcell-yellow text-turkcell-navy shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Canlı Liderlik Tablosu
            </button>
            <button
              onClick={() => setActiveTab('AI_ACCURACY')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'AI_ACCURACY' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Doğruluk Metrikleri
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card rounded-2xl p-6 border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>AI Model Doğruluğu</span>
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">%{aiAccuracy}</div>
            <div className="text-[11px] text-emerald-400 font-semibold">Aktif Model: {activeModelVersion}</div>
          </div>

          <div className="glass-card rounded-2xl p-6 border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Toplam Tahmin Kaydı</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalPredictions.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400">{misclassifiedCount} Düzeltme Kaydı</div>
          </div>

          <div className="glass-card rounded-2xl p-6 border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Lider Uzman</span>
              <Trophy className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-extrabold text-turkcell-yellow">Ahmet Yılmaz</div>
            <div className="text-[11px] text-purple-300 font-semibold">345 Puan • Platin Seviye</div>
          </div>

          <div className="glass-card rounded-2xl p-6 border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>SLA Başarı Oranı</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">%96.2</div>
            <div className="text-[11px] text-emerald-400">Son 30 günde 0 kritik ihlal</div>
          </div>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === 'LEADERBOARD' || activeTab === 'OVERVIEW' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-turkcell-yellow" />
                <h3 className="text-2xl font-bold text-white">Uzman Oyunlaştırma Liderlik Tablosu (Leaderboard)</h3>
              </div>
              <span className="text-xs text-slate-400">RabbitMQ `points.awarded` event'leri ile canlı güncellenir</span>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Sıra (Rank)</th>
                    <th className="px-6 py-4">Uzman Adı</th>
                    <th className="px-6 py-4">Seviye (Level)</th>
                    <th className="px-6 py-4">Kazanılan Rozetler</th>
                    <th className="px-6 py-4 text-right">Toplam Puan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {leaderboardData.map((row) => (
                    <tr key={row.rank} className={`hover:bg-slate-800/30 transition-colors ${row.isCurrentUser ? 'bg-turkcell-yellow/10 border-l-4 border-turkcell-yellow' : ''}`}>
                      <td className="px-6 py-4 font-bold text-white">
                        <div className="flex items-center space-x-2">
                          {row.rank === 1 && <Trophy className="w-5 h-5 text-amber-400 fill-amber-400" />}
                          {row.rank === 2 && <Trophy className="w-5 h-5 text-slate-300 fill-slate-300" />}
                          {row.rank === 3 && <Trophy className="w-5 h-5 text-amber-700 fill-amber-700" />}
                          <span>#{row.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-white">
                        {row.name} {row.isCurrentUser && <span className="text-[10px] text-turkcell-yellow font-bold">(Siz)</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          row.level === 'Platin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          row.level === 'Altın' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          row.level === 'Gümüş' ? 'bg-slate-500/20 text-slate-300' : 'bg-amber-900/20 text-amber-600'
                        }`}>
                          {row.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: row.badges }).map((_, i) => (
                            <Award key={i} className="w-4 h-4 text-turkcell-yellow" />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-turkcell-yellow text-lg">
                        {row.points} <span className="text-xs font-normal text-slate-400">Puan</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeTab === 'AI_ACCURACY' && (
          <div className="glass-card rounded-2xl p-8 space-y-6 border-blue-500/30">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Yapay Zeka Modeli Doğruluk Metrikleri</h3>
              <p className="text-slate-400 text-sm">Uzmanlar tarafından yapılan Segment Override işlemleri baz alınarak AI model performansı canlı hesaplanır.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Doğru Sınıflandırılan Tahminler</div>
                <div className="text-2xl font-bold text-emerald-400">{(totalPredictions - misclassifiedCount).toLocaleString()}</div>
              </div>
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Uzman Düzeltme Kayıtları (Misclassifications)</div>
                <div className="text-2xl font-bold text-rose-400">{misclassifiedCount}</div>
              </div>
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Model F1 Skoru</div>
                <div className="text-2xl font-bold text-turkcell-yellow">0.872</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
