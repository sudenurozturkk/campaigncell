'use client';

import React from 'react';
import DashboardShell from '../../../components/DashboardShell';
import {
  User, Phone, Mail, MapPin, Calendar, Wifi, PhoneCall,
  CreditCard, TrendingUp, Shield, Star, BarChart3, Zap,
  Package, Clock, Award
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 kpi-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{label}</span>
        <Icon className={`w-4 h-4 text-${color}-400`} />
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full">
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-${color}-500 to-${color}-400 transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-slate-600">
        <span>{value} GB</span>
        <span>{max} GB</span>
      </div>
    </div>
  );
}

export default function SubscriberProfilePage() {
  const profile = {
    name: 'Ahmet Yılmaz',
    gsm: '0555 111 22 33',
    email: 'ahmet.yilmaz@gmail.com',
    region: 'İstanbul - Kadıköy',
    segment: 'YUKSEK_DEGER',
    segmentLabel: 'Yüksek Değer',
    tariff: 'Turkcell Platinum 50GB',
    tenureMonths: 36,
    joinDate: 'Temmuz 2023',
    monthlySpend: 450,
    dataUsage: 38.5,
    dataLimit: 50,
    voiceMinutes: 820,
    smsCount: 45,
    pastAccepted: 4,
    pastRejected: 1,
    complaints: 0,
    dataUsageTrend: 15,
    loyaltyPoints: 2450,
    avgRating: 4.3,
  };

  return (
    <DashboardShell role="subscriber" userName={profile.name} userDetail={`${profile.gsm} • ${profile.segmentLabel}`}>
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Profile Header */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-turkcell-blue to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-turkcell-blue/30">
              AY
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-black text-white">{profile.name}</h1>
                <span className="px-3 py-1 rounded-lg bg-blue-500/15 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                  {profile.segmentLabel}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center space-x-1.5"><Phone className="w-3.5 h-3.5" /><span>{profile.gsm}</span></span>
                <span className="flex items-center space-x-1.5"><Mail className="w-3.5 h-3.5" /><span>{profile.email}</span></span>
                <span className="flex items-center space-x-1.5"><MapPin className="w-3.5 h-3.5" /><span>{profile.region}</span></span>
                <span className="flex items-center space-x-1.5"><Calendar className="w-3.5 h-3.5" /><span>Abone: {profile.joinDate} ({profile.tenureMonths} ay)</span></span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Aktif Tarife</div>
              <div className="text-lg font-bold text-turkcell-yellow">{profile.tariff}</div>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={CreditCard} label="Aylık Harcama" value={`₺${profile.monthlySpend}`} sub="Son 3 ay ortalaması" color="amber" />
          <StatCard icon={Wifi} label="Veri Kullanımı" value={`${profile.dataUsage} GB`} sub={`/ ${profile.dataLimit} GB limit`} color="blue" />
          <StatCard icon={PhoneCall} label="Sesli Arama" value={`${profile.voiceMinutes} dk`} sub="Bu ay" color="emerald" />
          <StatCard icon={TrendingUp} label="Kullanım Trendi" value={`+%${profile.dataUsageTrend}`} sub="Aylık veri artışı" color="purple" />
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Usage */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Veri Kullanımı Detayı</h3>
            </div>
            <ProgressBar value={profile.dataUsage} max={profile.dataLimit} color="blue" />
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-center">
                <div className="text-lg font-black text-white">{profile.dataUsage}</div>
                <div className="text-[9px] text-slate-500">Kullanılan (GB)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-center">
                <div className="text-lg font-black text-emerald-400">{(profile.dataLimit - profile.dataUsage).toFixed(1)}</div>
                <div className="text-[9px] text-slate-500">Kalan (GB)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-center">
                <div className="text-lg font-black text-turkcell-yellow">%{Math.round((profile.dataUsage / profile.dataLimit) * 100)}</div>
                <div className="text-[9px] text-slate-500">Doluluk</div>
              </div>
            </div>
          </div>

          {/* Campaign Interaction */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-turkcell-yellow" />
              <h3 className="text-lg font-bold text-white">Kampanya Etkileşimleri</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-center space-y-1">
                <div className="text-2xl font-black text-emerald-400">{profile.pastAccepted}</div>
                <div className="text-[10px] text-slate-400">Kabul Edilen</div>
              </div>
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/15 text-center space-y-1">
                <div className="text-2xl font-black text-rose-400">{profile.pastRejected}</div>
                <div className="text-[10px] text-slate-400">Reddedilen</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/15 text-center space-y-1">
                <div className="text-2xl font-black text-blue-400">{profile.complaints}</div>
                <div className="text-[10px] text-slate-400">Şikayet</div>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/15 text-center space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-2xl font-black text-amber-400">{profile.avgRating}</span>
                </div>
                <div className="text-[10px] text-slate-400">Ort. Değerlendirme</div>
              </div>
            </div>
          </div>

          {/* AI Profile */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">AI Profil Bilgileri</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bu bilgiler scikit-learn ML modeli tarafından kampanya öneri skorunuzun hesaplanmasında kullanılır.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Aylık Veri Kullanımı', value: `${profile.dataUsage} GB`, key: 'monthly_data_usage_gb' },
                { label: 'Aylık Ses Kullanımı', value: `${profile.voiceMinutes} dk`, key: 'monthly_voice_min' },
                { label: 'Aylık Harcama', value: `₺${profile.monthlySpend}`, key: 'monthly_spend_try' },
                { label: 'Abonelik Süresi', value: `${profile.tenureMonths} ay`, key: 'tenure_months' },
                { label: 'Kabul Edilen Teklif', value: `${profile.pastAccepted}`, key: 'past_accepted_count' },
                { label: 'Reddedilen Teklif', value: `${profile.pastRejected}`, key: 'past_rejected_count' },
                { label: 'Şikayet Sayısı', value: `${profile.complaints}`, key: 'complaint_count' },
                { label: 'Veri Kullanım Trendi', value: `+%${profile.dataUsageTrend}`, key: 'data_usage_trend_pct' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                  <div>
                    <span className="text-xs text-slate-300">{item.label}</span>
                    <span className="block text-[9px] font-mono text-slate-600">{item.key}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loyalty */}
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Sadakat & Segment</h3>
            </div>
            <div className="p-5 rounded-xl bg-gradient-to-br from-turkcell-yellow/10 to-amber-500/5 border border-turkcell-yellow/15 text-center space-y-3">
              <div className="text-4xl font-black text-turkcell-yellow">{profile.loyaltyPoints.toLocaleString()}</div>
              <div className="text-xs text-slate-400">Toplam Sadakat Puanı</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-center">
                <Shield className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                <div className="text-xs font-bold text-white">{profile.segmentLabel}</div>
                <div className="text-[9px] text-slate-500">AI Segment</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-center">
                <Clock className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                <div className="text-xs font-bold text-white">{profile.tenureMonths} Ay</div>
                <div className="text-[9px] text-slate-500">Abonelik Süresi</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
