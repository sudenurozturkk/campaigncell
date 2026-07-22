'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, XCircle, Star, Tag, Award, ArrowLeft, ShieldCheck } from 'lucide-react';

interface Offer {
  id: string;
  code: string;
  name: string;
  type: string;
  discountPercent: number;
  aiScore: number;
  conversionProbability: number;
  reasoning: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  userRating?: number;
}

export default function SubscriberDashboard() {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: 'camp-101',
      code: 'CMP-2026-000101',
      name: 'Yüksek Değerli Abone 20GB Ek Paket',
      type: 'EK_PAKET',
      discountPercent: 30,
      aiScore: 0.94,
      conversionProbability: 0.85,
      reasoning: 'AI Analizi: Aylık 35 GB yüksek veri tüketiminiz ve sadakatiniz nedeniyle %30 indirimli 20GB Ek Paket önerilmiştir.',
      status: 'PENDING',
    },
    {
      id: 'camp-102',
      code: 'CMP-2026-000102',
      name: '5G Akıllı Cihaz Fırsatı & Taahhüt İndirimi',
      type: 'CIHAZ_FIRSATI',
      discountPercent: 40,
      aiScore: 0.88,
      conversionProbability: 0.72,
      reasoning: 'AI Analizi: Cihaz değişim dönemi ve tarife kullanım alışkanlıklarınıza özel cihaz indirimi sunulmuştur.',
      status: 'PENDING',
    },
  ]);

  const [selectedOfferForRating, setSelectedOfferForRating] = useState<Offer | null>(null);
  const [ratingInput, setRatingInput] = useState<number>(5);
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
    setTimeout(() => setFeedbackSuccess(null), 4000);
  };

  const submitRating = () => {
    if (!selectedOfferForRating) return;
    setOffers((prev) =>
      prev.map((o) =>
        o.id === selectedOfferForRating.id ? { ...o, userRating: ratingInput } : o,
      ),
    );
    setFeedbackSuccess(`Teşekkürler! ${ratingInput} yıldız geri bildiriminiz alındı. Gamification servisine işlendi.`);
    setSelectedOfferForRating(null);
    setTimeout(() => setFeedbackSuccess(null), 4000);
  };

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
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-xs font-semibold">Abone Portalı</span>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Abone: <span className="font-semibold text-white">Ahmet Yılmaz (0555 111 22 33)</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Banner */}
        <div className="glass-card rounded-2xl p-8 border-turkcell-yellow/30 bg-gradient-to-r from-turkcell-navy/80 via-slate-900 to-turkcell-darkBg flex items-center justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-turkcell-yellow/20 text-turkcell-yellow text-xs font-bold uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Kişiselleştirilmiş AI Önerileri</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">Size Özel Fırsatlar</h2>
            <p className="text-slate-400 text-sm">Yapay zeka modelimiz kullanım alışkanlıklarınıza en uygun kampanyaları seçti.</p>
          </div>
        </div>

        {feedbackSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* Offers List */}
        <div className="space-y-6">
          {offers.map((offer) => (
            <div key={offer.id} className="glass-card rounded-2xl p-6 transition-all border border-slate-800 hover:border-turkcell-blue/50 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">{offer.code}</span>
                    <span className="px-2.5 py-0.5 rounded bg-turkcell-blue/20 text-turkcell-lightBlue text-xs font-semibold">{offer.type}</span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">%{offer.discountPercent} İNDİRİM</span>
                  </div>
                  <h3 className="text-xl font-bold text-white pt-1">{offer.name}</h3>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">AI Öneri Skoru</div>
                    <div className="text-lg font-extrabold text-turkcell-yellow">%{intScore(offer.aiScore)}</div>
                  </div>
                </div>
              </div>

              {/* Reasoning Box */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-1">
                <div className="font-semibold text-turkcell-yellow flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Neden Bu Teklif? (Explainable AI / XAI)</span>
                </div>
                <p>{offer.reasoning}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                {offer.status === 'PENDING' && (
                  <div className="flex items-center space-x-4 w-full md:w-auto">
                    <button
                      onClick={() => handleAccept(offer.id)}
                      className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Teklifi Kabul Et</span>
                    </button>
                    <button
                      onClick={() => handleReject(offer.id)}
                      className="flex-1 md:flex-initial px-6 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold text-sm border border-rose-500/30 transition-all flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reddet</span>
                    </button>
                  </div>
                )}

                {offer.status === 'ACCEPTED' && (
                  <div className="flex items-center space-x-4">
                    <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center space-x-2 border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Teklif Kabul Edildi ve Hattınıza Tanımlandı</span>
                    </span>
                    {offer.userRating && (
                      <span className="text-amber-400 text-sm font-bold flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>{offer.userRating} / 5 Yıldız</span>
                      </span>
                    )}
                  </div>
                )}

                {offer.status === 'REJECTED' && (
                  <span className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30">
                    Teklif Reddedildi
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Feedback & Star Rating Modal */}
      {selectedOfferForRating && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-2xl max-w-md w-full p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
                <Star className="w-6 h-6 fill-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Teklifi Değerlendirin</h3>
              <p className="text-slate-400 text-xs">Deneyiminizi 1-5 yıldız arasında puanlayarak yapay zeka modelimizi geliştirin.</p>
            </div>

            <div className="flex items-center justify-center space-x-3 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingInput(star)}
                  className="p-2 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= ratingInput ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              onClick={submitRating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-turkcell-yellow to-amber-500 text-turkcell-navy font-bold text-sm hover:opacity-90 transition-all"
            >
              Puanı Gönder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function intScore(val: number): number {
  return Math.round(val * 100);
}
