'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Cpu, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck, Tag, Layers, Edit3 } from 'lucide-react';

interface CaseItem {
  id: string;
  caseCode: string;
  campaignName: string;
  segment: string;
  priority: 'DUSUK' | 'ORTA' | 'YUKSEK' | 'KRITIK';
  status: 'YENI' | 'ATANDI' | 'OPTIMIZE_EDILIYOR' | 'TAMAMLANDI' | 'YAYINDA';
  aiScore: number;
  assignedExpert: string;
  isAiMisclassified: boolean;
  optimizationNote?: string;
  slaDeadline: string;
  slaBreached: boolean;
}

export default function ExpertDashboard() {
  const [cases, setCases] = useState<CaseItem[]>([
    {
      id: 'case-1',
      caseCode: 'CMP-2026-000101',
      campaignName: 'Yüksek Değerli Abone 20GB Ek Paket',
      segment: 'YUKSEK_DEGER',
      priority: 'YUKSEK',
      status: 'OPTIMIZE_EDILIYOR',
      aiScore: 0.94,
      assignedExpert: 'Ahmet Yılmaz (Siz)',
      isAiMisclassified: false,
      optimizationNote: 'Ekstra %5Sadakat indirimi tanımlandı.',
      slaDeadline: '2026-07-24 14:00',
      slaBreached: false,
    },
    {
      id: 'case-2',
      caseCode: 'CMP-2026-000102',
      campaignName: 'Churn Önleme Cihaz Fırsatı',
      segment: 'BELIRSIZ',
      priority: 'KRITIK',
      status: 'YENI',
      aiScore: 0.72,
      assignedExpert: 'Atanmadı',
      isAiMisclassified: false,
      slaDeadline: '2026-07-23 18:00',
      slaBreached: false,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState<CaseItem | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<CaseItem | null>(null);

  // Form States
  const [newCampName, setNewCampName] = useState('');
  const [newCampType, setNewCampType] = useState('EK_PAKET');
  const [newSegment, setNewSegment] = useState('YUKSEK_DEGER');
  const [newDiscount, setNewDiscount] = useState('20');

  // Override States
  const [overrideSegmentInput, setOverrideSegmentInput] = useState('RISKLI_KAYIP');
  const [overrideReasonInput, setOverrideReasonInput] = useState('');

  // Status Change States
  const [targetStatusInput, setTargetStatusInput] = useState<'TAMAMLANDI' | 'YAYINDA' | 'OPTIMIZE_EDILIYOR'>('TAMAMLANDI');
  const [statusNoteInput, setStatusNoteInput] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `CMP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newCase: CaseItem = {
      id: `case-${Date.now()}`,
      caseCode: code,
      campaignName: newCampName,
      segment: newSegment,
      priority: newSegment === 'RISKLI_KAYIP' ? 'KRITIK' : 'ORTA',
      status: 'YENI',
      aiScore: 0.85,
      assignedExpert: 'Ahmet Yılmaz (Siz)',
      isAiMisclassified: false,
      slaDeadline: '2026-07-25 12:00',
      slaBreached: false,
    };

    setCases([newCase, ...cases]);
    setShowCreateModal(false);
    setNewCampName('');
  };

  const handleOverrideSegment = () => {
    if (!showSegmentModal || !overrideReasonInput.trim()) return;
    setCases((prev) =>
      prev.map((c) =>
        c.id === showSegmentModal.id
          ? { ...c, segment: overrideSegmentInput, isAiMisclassified: true }
          : c,
      ),
    );
    setShowSegmentModal(null);
    setOverrideReasonInput('');
  };

  const handleStatusChange = () => {
    if (!showStatusModal) return;
    if (targetStatusInput === 'TAMAMLANDI' && !statusNoteInput.trim()) {
      setStatusError('Vaka TAMAMLANDI durumuna geçirilirken optimizasyon notu girilmesi zorunludur!');
      return;
    }

    setCases((prev) =>
      prev.map((c) =>
        c.id === showStatusModal.id
          ? {
              ...c,
              status: targetStatusInput,
              optimizationNote: statusNoteInput || c.optimizationNote,
            }
          : c,
      ),
    );

    setShowStatusModal(null);
    setStatusNoteInput('');
    setStatusError(null);
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
              <span className="px-2.5 py-0.5 rounded bg-turkcell-yellow text-turkcell-navy text-xs font-bold">Uzman Paneli</span>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-turkcell-yellow to-amber-500 text-turkcell-navy font-bold text-xs hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kampanya Oluştur</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Optimizasyon Vakaları</h2>
            <p className="text-slate-400 text-sm">State Machine kuralları ile kampanyaların yaşam döngüsünü yönetin.</p>
          </div>
        </div>

        {/* Cases Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Vaka Kodu</th>
                  <th className="px-6 py-4">Kampanya Adı</th>
                  <th className="px-6 py-4">Segment</th>
                  <th className="px-6 py-4">Öncelik</th>
                  <th className="px-6 py-4">Durum (State)</th>
                  <th className="px-6 py-4">Atanan Uzman</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-turkcell-yellow font-bold">{c.caseCode}</td>
                    <td className="px-6 py-4 font-medium text-white">{c.campaignName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-semibold">{c.segment}</span>
                        {c.isAiMisclassified && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                            AI Düzeltildi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        c.priority === 'KRITIK' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-turkcell-blue/20 text-turkcell-lightBlue border border-turkcell-blue/30 text-xs font-bold">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{c.assignedExpert}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setShowSegmentModal(c)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                      >
                        Segment Override
                      </button>
                      <button
                        onClick={() => {
                          setShowStatusModal(c);
                          setStatusError(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-turkcell-yellow/20 hover:bg-turkcell-yellow/30 text-turkcell-yellow text-xs font-bold border border-turkcell-yellow/30 transition-colors"
                      >
                        Durum Değiştir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-2xl max-w-lg w-full p-6 space-y-6">
            <h3 className="text-xl font-bold text-white">Yeni Kampanya Oluştur</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kampanya Adı</label>
                <input
                  type="text"
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-turkcell-yellow outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kampanya Türü</label>
                  <select
                    value={newCampType}
                    onChange={(e) => setNewCampType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-turkcell-yellow outline-none"
                  >
                    <option value="EK_PAKET">Ek Paket</option>
                    <option value="TARIFE_YUKSELTME">Tarife Yükseltme</option>
                    <option value="CIHAZ_FIRSATI">Cihaz Fırsatı</option>
                    <option value="SADAKAT">Sadakat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Hedef Segment</label>
                  <select
                    value={newSegment}
                    onChange={(e) => setNewSegment(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-turkcell-yellow outline-none"
                  >
                    <option value="YUKSEK_DEGER">Yüksek Değer</option>
                    <option value="RISKLI_KAYIP">Riskli Kayıp (Churn)</option>
                    <option value="YENI_ABONE">Yeni Abone</option>
                    <option value="PASIF">Pasif</option>
                    <option value="BELIRSIZ">Belirsiz (AI Kuyruğu)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-turkcell-yellow text-turkcell-navy text-xs font-bold"
                >
                  Oluştur & Vaka Aç
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Segment Override Modal */}
      {showSegmentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-2xl max-w-md w-full p-6 space-y-6">
            <h3 className="text-xl font-bold text-white">Segment Override (AI Düzeltme)</h3>
            <p className="text-xs text-slate-400">AI tarafından önerilen segmenti manuel güncelleyin. Bu işlem AI modelinin doğruluk metriğini güncelleyecektir.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Yeni Segment</label>
                <select
                  value={overrideSegmentInput}
                  onChange={(e) => setOverrideSegmentInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
                >
                  <option value="RISKLI_KAYIP">RISKLI_KAYIP</option>
                  <option value="YUKSEK_DEGER">YUKSEK_DEGER</option>
                  <option value="YENI_ABONE">YENI_ABONE</option>
                  <option value="PASIF">PASIF</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Segment Değişikliği Nedeni</label>
                <textarea
                  value={overrideReasonInput}
                  onChange={(e) => setOverrideReasonInput(e.target.value)}
                  placeholder="Müşteri taahhüt iptali istedi..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm h-24"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSegmentModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                İptal
              </button>
              <button
                onClick={handleOverrideSegment}
                className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Segmenti Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Transition Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-2xl max-w-md w-full p-6 space-y-6">
            <h3 className="text-xl font-bold text-white">Vaka Statü Geçişi</h3>

            {statusError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {statusError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Hedef Statü</label>
                <select
                  value={targetStatusInput}
                  onChange={(e) => setTargetStatusInput(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
                >
                  <option value="OPTIMIZE_EDILIYOR">OPTIMIZE_EDILIYOR</option>
                  <option value="TAMAMLANDI">TAMAMLANDI (Not Zorunlu)</option>
                  <option value="YAYINDA">YAYINDA (Kampanya Aktifleşir)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Optimizasyon Notu</label>
                <textarea
                  value={statusNoteInput}
                  onChange={(e) => setStatusNoteInput(e.target.value)}
                  placeholder="İndirim %25 olarak optimize edildi..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm h-24"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                İptal
              </button>
              <button
                onClick={handleStatusChange}
                className="px-6 py-2.5 rounded-xl bg-turkcell-yellow text-turkcell-navy font-bold text-xs"
              >
                Durumu Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
