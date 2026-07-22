'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardShell from '../../components/DashboardShell';
import {
  Sparkles, CheckCircle2, XCircle, Star,
  Gift, TrendingUp, Zap, Package, Smartphone,
  Heart, Info
} from 'lucide-react';

interface Offer {
  id: string;
  code: string;
  name: string;
  type: string;
  typeLabel: string;
  discountPercent: number;
  aiScore: number;
  conversionProbability: number;
  reasoning: string;
  segment: string;
  validUntil: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  userRating?: number;
  icon: React.ElementType;
}

function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#10B981' : score >= 70 ? '#FFC72C' : '#F43F5E';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="score-ring" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-black text-white">{score}</span>
      </div>
    </div>
  );
}

export default function SubscriberDashboard() {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: 'camp-101', code: 'CMP-2026-000101',
      name: 'Yüksek Değerli Abone 20GB Ek Paket',
      type: 'EK_PAKET', typeLabel: 'Ek Paket',
      discountPercent: 30, aiScore: 0.94, conversionProbability: 0.85,
      reasoning: 'AI Analizi: Aylık 35 GB yüksek veri tüketiminiz, 24 aylık sadakatiniz ve son 3 kampanyayı kabul etmeniz nedeniyle %30 indirimli 20GB Ek Paket önerilmiştir. Veri kullanım trendiniz aylık %15 artış göstermektedir.',
      segment: 'YUKSEK_DEGER', validUntil: '31 Temmuz 2026',
      status: 'PENDING', icon: Package,
    },
    {
      id: 'camp-102', code: 'CMP-2026-000102',
      name: '5G Akıllı Cihaz Fırsatı & Taahhüt İndirimi',
      type: 'CIHAZ_FIRSATI', typeLabel: 'Cihaz Fırsatı',
      discountPercent: 40, aiScore: 0.88, conversionProbability: 0.72,
      reasoning: 'AI Analizi: Cihaz değişim döneminiz (2+ yıl) ve aylık 450₺ harcama kapasiteniz göz önüne alınarak 5G cihaz indirimi sunulmuştur. Tarife yükseltme eğiliminiz de yüksektir.',
      segment: 'YUKSEK_DEGER', validUntil: '15 Ağustos 2026',
      status: 'PENDING', icon: Smartphone,
    },
    {
      id: 'camp-103', code: 'CMP-2026-000103',
      name: 'Sadakat Ödülü — Yıllık Ücretsiz Hız Artışı',
      type: 'SADAKAT', typeLabel: 'Sadakat',
      discountPercent: 100, aiScore: 0.91, conversionProbability: 0.89,
      reasoning: 'AI Analizi: 36 aylık kesintisiz aboneliğiniz ve sıfır şikayet kaydınız nedeniyle sadakat ödülü olarak yıllık ücretsiz hız artışı (100 Mbps → 200 Mbps) sunulmaktadır.',
      segment: 'YUKSEK_DEGER', validUntil: '1 Eylül 2026',
      status: 'PENDING', icon: Heart,
    },
  ]);

  const [selectedOfferForRating, setSelectedOfferForRating] = useState<Offer | null>(null);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const handleAccept = (id: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'ACCEPTED' } : o)),
    );
    const offer = offers.find((o) => o.id === id);
    if (offer) {
      setSelectedOfferForRating({ ...offer, status: 'ACCEPTED' });
    }
  };

  const handleReject = (id: string) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'REJECTED' } : o)),
    );
    setFeedbackSuccess('Teklif reddedildi. AI modelimiz gelecekteki benzer önerileri buna göre güncelleyecektir.');
    setTimeout(() => setFeedbackSuccess(null), 5000);
  };

  const submitRating = () => {
    if (!selectedOfferForRating) return;
    setOffers((prev) =>
      prev.map((o) =>
        o.id === selectedOfferForRating.id ? { ...o, userRating: ratingInput } : o,
      ),
    );
    setFeedbackSuccess(
      `Teşekkürler! ${ratingInput} yıldız geri bildiriminiz Gamification servisine işlendi. ${
        ratingInput <= 2 ? '(-3 puan uzman cezası uygulandı)' : '(+10 puan uzman bonusu)'
      }`,
    );
    setSelectedOfferForRating(null);
    setRatingInput(5);
    setTimeout(() => setFeedbackSuccess(null), 5000);
  };

  const typeColors: Record<string, string> = {
    EK_PAKET: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    CIHAZ_FIRSATI: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    TARIFE_YUKSELTME: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    SADAKAT: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  };

  return (
    <DashboardShell role="subscriber" userName="Ahmet Yılmaz" userDetail="0555 111 22 33 • Yüksek Değer">
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Banner */}
        <div className="glass-card rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-turkcell-yellow/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />
          <div className="relative space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-turkcell-yellow/10 text-turkcell-yellow text-xs font-bold uppercase tracking-wider border border-turkcell-yellow/15 shimmer">
              <Sparkles className="w-4 h-4" />
              <span>AI Kişiselleştirilmiş Öneriler</span>
            </div>
            <h2 className="text-4xl font-black text-white leading-tight">
              Size Özel <span className="gradient-text-turkcell">Fırsatlar</span>
            </h2>
            <p className="text-slate-400 text-base max-w-xl leading-relaxed">
              scikit-learn ML motorumuz, kullanım alışkanlıklarınızı, harcama trendlerinizi ve
              geçmiş etkileşimlerinizi analiz ederek en uygun kampanyaları seçti.
            </p>
            <div className="flex items-center space-x-6 pt-2">
              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Aylık veri kullanım trendi: <span className="text-emerald-400 font-bold">+15%</span></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <Zap className="w-4 h-4 text-turkcell-yellow" />
                <span>Segment: <span className="text-turkcell-yellow font-bold">YÜKSEK DEĞER</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Toast */}
        {feedbackSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-sm flex items-center space-x-3 animate-[fadeIn_0.3s_ease]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* Offers */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">{offers.filter((o) => o.status === 'PENDING').length} Aktif Teklif</h3>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5" />
              <span>Teklifleri inceleyip kabul veya reddedin</span>
            </div>
          </div>

          {offers.map((offer) => {
            const IconComp = offer.icon;
            return (
              <div key={offer.id} className="glass-card rounded-2xl overflow-hidden transition-all duration-300">
                {/* Top Bar */}
                <div className="px-6 py-3 bg-slate-900/50 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-[11px] text-slate-500">{offer.code}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${typeColors[offer.type] || 'bg-slate-800 text-slate-400'}`}>
                      {offer.typeLabel}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                      %{offer.discountPercent} İNDİRİM
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Son: {offer.validUntil}</span>
                </div>

                <div className="p-6 space-y-5">
                  {/* Title Row */}
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-turkcell-yellow/10 border border-turkcell-yellow/15 flex items-center justify-center text-turkcell-yellow shrink-0">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white leading-snug">{offer.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">Segment: {offer.segment}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">AI Skoru</div>
                        <ScoreRing score={Math.round(offer.aiScore * 100)} />
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Dönüşüm</div>
                        <ScoreRing score={Math.round(offer.conversionProbability * 100)} />
                      </div>
                    </div>
                  </div>

                  {/* XAI Reasoning */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-turkcell-yellow/10 space-y-2">
                    <div className="flex items-center space-x-2 text-turkcell-yellow text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Neden Bu Teklif? — Explainable AI (XAI)</span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{offer.reasoning}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    {offer.status === 'PENDING' && (
                      <div className="flex items-center space-x-3 w-full md:w-auto">
                        <button
                          onClick={() => handleAccept(offer.id)}
                          className="flex-1 md:flex-initial px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 hover:scale-[1.02]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Teklifi Kabul Et</span>
                        </button>
                        <button
                          onClick={() => handleReject(offer.id)}
                          className="flex-1 md:flex-initial px-8 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-sm border border-rose-500/20 hover:border-rose-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reddet</span>
                        </button>
                      </div>
                    )}

                    {offer.status === 'ACCEPTED' && (
                      <div className="flex items-center space-x-4">
                        <span className="px-5 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center space-x-2 border border-emerald-500/20">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Teklif Kabul Edildi — Hattınıza Tanımlandı</span>
                        </span>
                        {offer.userRating && (
                          <div className="flex items-center space-x-1.5 text-amber-400 text-sm font-bold">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-4 h-4 ${s <= offer.userRating! ? 'fill-amber-400' : 'text-slate-700'}`} />
                            ))}
                            <span className="text-xs ml-1">{offer.userRating}/5</span>
                          </div>
                        )}
                      </div>
                    )}

                    {offer.status === 'REJECTED' && (
                      <span className="px-5 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20 flex items-center space-x-2">
                        <XCircle className="w-4 h-4" />
                        <span>Teklif Reddedildi</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Star Rating Modal */}
      {selectedOfferForRating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-3xl max-w-md w-full p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <Star className="w-8 h-8 fill-amber-400" />
              </div>
              <h3 className="text-2xl font-black text-white">Teklifi Değerlendirin</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Deneyiminizi 1-5 yıldız puanlayın. Puanınız Gamification servisine iletilecek
                ve uzmanın performans metriklerini etkileyecektir.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingInput(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="star-interactive p-1 focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || ratingInput) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-center text-xs text-slate-500">
              {ratingInput <= 2 ? '⚠️ Düşük puan → Uzman -3 puan cezası' : ratingInput >= 4 ? '🌟 Yüksek puan → Uzman +10 bonus puan' : '👍 Orta puan'}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedOfferForRating(null)}
                className="flex-1 py-3.5 rounded-xl bg-slate-800/80 text-slate-300 text-sm font-semibold hover:bg-slate-700/80 transition-all"
              >
                Atla
              </button>
              <button
                onClick={submitRating}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-turkcell-yellow to-amber-500 text-turkcell-navy font-black text-sm hover:opacity-90 transition-all shadow-lg shadow-turkcell-yellow/20"
              >
                Puanı Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
