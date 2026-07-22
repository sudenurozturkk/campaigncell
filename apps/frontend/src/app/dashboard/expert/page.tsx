'use client';

import React, { useState, useMemo } from 'react';
import DashboardShell from '../../components/DashboardShell';
import {
  Plus, AlertTriangle, CheckCircle2, Clock,
  Layers, ChevronRight, XCircle, Timer, RefreshCw, Eye
} from 'lucide-react';

interface CaseItem {
  id: string;
  caseCode: string;
  campaignName: string;
  campaignType: string;
  segment: string;
  priority: 'DUSUK' | 'ORTA' | 'YUKSEK' | 'KRITIK';
  status: 'YENI' | 'ATANDI' | 'OPTIMIZE_EDILIYOR' | 'TEST_EDILIYOR' | 'TAMAMLANDI' | 'YAYINDA' | 'ARSIVLENDI';
  aiScore: number;
  assignedExpert: string;
  isAiMisclassified: boolean;
  optimizationNote?: string;
  slaDeadline: string;
  slaBreached: boolean;
  discountPercent: number;
  createdAt: string;
}

const STATE_FLOW = ['YENI', 'ATANDI', 'OPTIMIZE_EDILIYOR', 'TEST_EDILIYOR', 'TAMAMLANDI', 'YAYINDA', 'ARSIVLENDI'];

const VALID_TRANSITIONS: Record<string, string[]> = {
  YENI: ['ATANDI'],
  ATANDI: ['OPTIMIZE_EDILIYOR'],
  OPTIMIZE_EDILIYOR: ['TEST_EDILIYOR'],
  TEST_EDILIYOR: ['TAMAMLANDI'],
  TAMAMLANDI: ['YAYINDA'],
  YAYINDA: ['ARSIVLENDI'],
  ARSIVLENDI: [],
};

const SLA_HOURS: Record<string, number> = { KRITIK: 2, YUKSEK: 8, ORTA: 24, DUSUK: 72 };

function getSlaTimeLeft(deadline: string): { text: string; urgent: boolean; breached: boolean } {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  if (diffMs <= 0) return { text: 'SLA AŞILDI', urgent: true, breached: true };
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return {
    text: `${hours}s ${mins}dk kaldı`,
    urgent: hours < 2,
    breached: false,
  };
}

const priorityConfig: Record<string, { bg: string; text: string; dot: string }> = {
  KRITIK: { bg: 'bg-rose-500/15', text: 'text-rose-400', dot: 'bg-rose-400' },
  YUKSEK: { bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400' },
  ORTA: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  DUSUK: { bg: 'bg-slate-500/15', text: 'text-slate-400', dot: 'bg-slate-400' },
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  YENI: { bg: 'bg-sky-500/15 border-sky-500/20', text: 'text-sky-400' },
  ATANDI: { bg: 'bg-indigo-500/15 border-indigo-500/20', text: 'text-indigo-400' },
  OPTIMIZE_EDILIYOR: { bg: 'bg-amber-500/15 border-amber-500/20', text: 'text-amber-400' },
  TEST_EDILIYOR: { bg: 'bg-purple-500/15 border-purple-500/20', text: 'text-purple-400' },
  TAMAMLANDI: { bg: 'bg-emerald-500/15 border-emerald-500/20', text: 'text-emerald-400' },
  YAYINDA: { bg: 'bg-turkcell-yellow/15 border-turkcell-yellow/20', text: 'text-turkcell-yellow' },
  ARSIVLENDI: { bg: 'bg-slate-500/15 border-slate-500/20', text: 'text-slate-400' },
};

export default function ExpertDashboard() {
  const [cases, setCases] = useState<CaseItem[]>([
    {
      id: 'case-1', caseCode: 'CMP-2026-000101', campaignName: 'Yüksek Değerli Abone 20GB Ek Paket',
      campaignType: 'EK_PAKET', segment: 'YUKSEK_DEGER', priority: 'YUKSEK',
      status: 'OPTIMIZE_EDILIYOR', aiScore: 0.94, assignedExpert: 'Siz (Ahmet Yılmaz)',
      isAiMisclassified: false, optimizationNote: 'Ekstra %5 sadakat indirimi tanımlandı.',
      slaDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      slaBreached: false, discountPercent: 30, createdAt: '2026-07-22 09:00',
    },
    {
      id: 'case-2', caseCode: 'CMP-2026-000102', campaignName: 'Churn Önleme Cihaz Fırsatı',
      campaignType: 'CIHAZ_FIRSATI', segment: 'RISKLI_KAYIP', priority: 'KRITIK',
      status: 'YENI', aiScore: 0.72, assignedExpert: 'Atanmadı',
      isAiMisclassified: false,
      slaDeadline: new Date(Date.now() + 1.5 * 60 * 60 * 1000).toISOString(),
      slaBreached: false, discountPercent: 40, createdAt: '2026-07-22 10:30',
    },
    {
      id: 'case-3', caseCode: 'CMP-2026-000103', campaignName: 'Yeni Abone Hoş Geldin Paketi',
      campaignType: 'EK_PAKET', segment: 'YENI_ABONE', priority: 'ORTA',
      status: 'TAMAMLANDI', aiScore: 0.85, assignedExpert: 'Siz (Ahmet Yılmaz)',
      isAiMisclassified: false, optimizationNote: 'Hedef kitle: 18-25 yaş arası yeni aboneler. %15 hoş geldin indirimi.',
      slaDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
      slaBreached: false, discountPercent: 15, createdAt: '2026-07-21 14:00',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState<CaseItem | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<CaseItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<CaseItem | null>(null);

  // Create Form
  const [newCampName, setNewCampName] = useState('');
  const [newCampType, setNewCampType] = useState('EK_PAKET');
  const [newSegment, setNewSegment] = useState('YUKSEK_DEGER');
  const [newDiscount, setNewDiscount] = useState('20');

  // Override
  const [overrideSegmentInput, setOverrideSegmentInput] = useState('RISKLI_KAYIP');
  const [overrideReasonInput, setOverrideReasonInput] = useState('');

  // Status
  const [statusNoteInput, setStatusNoteInput] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `CMP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newCase: CaseItem = {
      id: `case-${Date.now()}`, caseCode: code, campaignName: newCampName,
      campaignType: newCampType, segment: newSegment,
      priority: newSegment === 'RISKLI_KAYIP' ? 'KRITIK' : 'ORTA',
      status: 'YENI', aiScore: 0.85, assignedExpert: 'Siz (Ahmet Yılmaz)',
      isAiMisclassified: false,
      slaDeadline: new Date(Date.now() + SLA_HOURS[newSegment === 'RISKLI_KAYIP' ? 'KRITIK' : 'ORTA'] * 60 * 60 * 1000).toISOString(),
      slaBreached: false, discountPercent: parseInt(newDiscount) || 20,
      createdAt: new Date().toLocaleString('tr-TR'),
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
          ? { ...c, segment: overrideSegmentInput, isAiMisclassified: true,
              priority: overrideSegmentInput === 'RISKLI_KAYIP' ? 'KRITIK' : c.priority }
          : c,
      ),
    );
    setShowSegmentModal(null);
    setOverrideReasonInput('');
  };

  const handleStatusChange = (targetStatus: string) => {
    if (!showStatusModal) return;
    const validTargets = VALID_TRANSITIONS[showStatusModal.status] || [];
    if (!validTargets.includes(targetStatus)) {
      setStatusError(`HTTP 422: Geçersiz durum geçişi! "${showStatusModal.status}" → "${targetStatus}" geçişi State Machine kurallarına aykırıdır.`);
      return;
    }
    if (targetStatus === 'TAMAMLANDI' && !statusNoteInput.trim()) {
      setStatusError('Vaka TAMAMLANDI durumuna geçirilirken optimizasyon notu girilmesi zorunludur!');
      return;
    }
    setCases((prev) =>
      prev.map((c) =>
        c.id === showStatusModal.id
          ? { ...c, status: targetStatus as CaseItem['status'], optimizationNote: statusNoteInput || c.optimizationNote }
          : c,
      ),
    );
    setShowStatusModal(null);
    setStatusNoteInput('');
    setStatusError(null);
  };

  // Sort: KRITIK first, SLA breached first
  const sortedCases = useMemo(() => {
    const priorityOrder = { KRITIK: 0, YUKSEK: 1, ORTA: 2, DUSUK: 3 };
    return [...cases].sort((a, b) => {
      const aSla = getSlaTimeLeft(a.slaDeadline);
      const bSla = getSlaTimeLeft(b.slaDeadline);
      if (aSla.breached && !bSla.breached) return -1;
      if (!aSla.breached && bSla.breached) return 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [cases]);

  const kpis = useMemo(() => ({
    total: cases.length,
    active: cases.filter((c) => !['ARSIVLENDI', 'YAYINDA'].includes(c.status)).length,
    critical: cases.filter((c) => c.priority === 'KRITIK').length,
    completed: cases.filter((c) => c.status === 'YAYINDA' || c.status === 'ARSIVLENDI').length,
  }), [cases]);

  return (
    <DashboardShell role="expert" userName="Ahmet Yılmaz" userDetail="uzman@turkcell.com.tr • Altın Seviye">
      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        {/* Page Header Row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Optimizasyon Vakaları</h1>
            <p className="text-xs text-slate-500 mt-1">SLA aşımı olan vakalar en üstte sabitlenir</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-turkcell-yellow to-amber-500 text-turkcell-navy font-black text-xs hover:opacity-90 hover:scale-[1.02] transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kampanya Oluştur</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Vaka', value: kpis.total, icon: Layers, color: 'blue' },
            { label: 'Aktif İşlemde', value: kpis.active, icon: RefreshCw, color: 'amber' },
            { label: 'Kritik Öncelik', value: kpis.critical, icon: AlertTriangle, color: 'rose' },
            { label: 'Tamamlanan', value: kpis.completed, icon: CheckCircle2, color: 'emerald' },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-card rounded-2xl p-5 kpi-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{kpi.label}</span>
                <kpi.icon className={`w-4 h-4 text-${kpi.color}-400`} />
              </div>
              <div className="text-3xl font-black text-white">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* State Machine Flow */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center space-x-2 mb-4">
            <Layers className="w-4 h-4 text-turkcell-yellow" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">State Machine Akışı (§4.2)</span>
          </div>
          <div className="flex items-center space-x-1 overflow-x-auto pb-2">
            {STATE_FLOW.map((state, i) => {
              const sc = statusConfig[state];
              return (
                <React.Fragment key={state}>
                  <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap border ${sc.bg} ${sc.text}`}>
                    {state}
                  </div>
                  {i < STATE_FLOW.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Cases Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Optimizasyon Vakaları</h2>
            <span className="text-[11px] text-slate-500">SLA aşımı olan vakalar en üstte sabitlenir</span>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/60 text-slate-500 uppercase text-[10px] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="px-5 py-3.5">Vaka Kodu</th>
                    <th className="px-5 py-3.5">Kampanya Adı</th>
                    <th className="px-5 py-3.5">Segment</th>
                    <th className="px-5 py-3.5">Öncelik</th>
                    <th className="px-5 py-3.5">Durum</th>
                    <th className="px-5 py-3.5">SLA Kalan</th>
                    <th className="px-5 py-3.5 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {sortedCases.map((c) => {
                    const sla = getSlaTimeLeft(c.slaDeadline);
                    const pc = priorityConfig[c.priority];
                    const sc = statusConfig[c.status];
                    return (
                      <tr key={c.id} className={`table-row-hover ${sla.breached ? 'bg-rose-500/5' : ''} ${c.priority === 'KRITIK' && !sla.breached ? 'bg-rose-500/[0.03]' : ''}`}>
                        <td className="px-5 py-4 font-mono text-[11px] text-turkcell-yellow font-bold">{c.caseCode}</td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white text-sm">{c.campaignName}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{c.campaignType} • %{c.discountPercent} indirim</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-xs font-semibold text-slate-300">{c.segment}</span>
                            {c.isAiMisclassified && (
                              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 text-[9px] font-bold border border-rose-500/20">
                                AI Düzeltildi
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${pc.bg} ${pc.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${pc.dot} ${c.priority === 'KRITIK' ? 'status-dot' : ''}`} />
                            <span>{c.priority}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border ${sc.bg} ${sc.text}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className={`flex items-center space-x-1.5 text-xs font-semibold ${
                            sla.breached ? 'text-rose-400 sla-critical' : sla.urgent ? 'text-orange-400' : 'text-slate-400'
                          }`}>
                            <Timer className="w-3.5 h-3.5" />
                            <span>{sla.text}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setShowDetailModal(c)}
                              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white transition-all"
                              title="Detay"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setShowSegmentModal(c)}
                              className="px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-xs font-medium text-slate-300 transition-all"
                            >
                              Override
                            </button>
                            <button
                              onClick={() => {
                                setShowStatusModal(c);
                                setStatusError(null);
                                setStatusNoteInput('');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-turkcell-yellow/15 hover:bg-turkcell-yellow/25 text-turkcell-yellow text-xs font-bold border border-turkcell-yellow/20 transition-all"
                            >
                              Durum Değiştir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-3xl max-w-lg w-full p-8 space-y-6">
            <div>
              <h3 className="text-xl font-black text-white">Yeni Kampanya Oluştur</h3>
              <p className="text-xs text-slate-500 mt-1">Kampanya otomatik vaka kodu alacak ve AI analiz kuyruğuna eklenecektir.</p>
            </div>
            <form onSubmit={handleCreateCampaign} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Kampanya Adı</label>
                <input type="text" value={newCampName} onChange={(e) => setNewCampName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white text-sm focus:border-turkcell-yellow/60 focus:ring-1 focus:ring-turkcell-yellow/20 outline-none transition-all"
                  placeholder="Örn: Aile Plus 50GB Paket" required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Kampanya Türü</label>
                  <select value={newCampType} onChange={(e) => setNewCampType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white text-sm outline-none">
                    <option value="EK_PAKET">Ek Paket</option>
                    <option value="TARIFE_YUKSELTME">Tarife Yükseltme</option>
                    <option value="CIHAZ_FIRSATI">Cihaz Fırsatı</option>
                    <option value="SADAKAT">Sadakat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Hedef Segment</label>
                  <select value={newSegment} onChange={(e) => setNewSegment(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white text-sm outline-none">
                    <option value="YUKSEK_DEGER">Yüksek Değer</option>
                    <option value="RISKLI_KAYIP">Riskli Kayıp (Churn)</option>
                    <option value="YENI_ABONE">Yeni Abone</option>
                    <option value="PASIF">Pasif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">İndirim %</label>
                  <input type="number" min="1" max="100" value={newDiscount} onChange={(e) => setNewDiscount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white text-sm outline-none" />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/15 text-xs text-amber-300">
                SLA süresi otomatik hesaplanır: {newSegment === 'RISKLI_KAYIP' ? 'KRİTİK — 2 Saat' : 'ORTA — 24 Saat'}
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="px-5 py-3 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-semibold hover:bg-slate-700/80 transition-all">
                  İptal
                </button>
                <button type="submit"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-turkcell-yellow to-amber-500 text-turkcell-navy font-black text-xs shadow-lg shadow-amber-500/20">
                  Oluştur & Vaka Aç
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSegmentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-3xl max-w-md w-full p-8 space-y-6">
            <div>
              <h3 className="text-xl font-black text-white">Segment Override (AI Düzeltme)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Bu işlem <code className="text-turkcell-yellow">is_ai_misclassified = true</code> olarak kaydedilir ve
                AI doğruluk metriğini günceller.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/15 text-xs text-blue-300">
              Mevcut segment: <span className="font-bold text-white">{showSegmentModal.segment}</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Yeni Segment</label>
                <select value={overrideSegmentInput} onChange={(e) => setOverrideSegmentInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white text-sm outline-none">
                  <option value="RISKLI_KAYIP">RISKLI_KAYIP</option>
                  <option value="YUKSEK_DEGER">YUKSEK_DEGER</option>
                  <option value="YENI_ABONE">YENI_ABONE</option>
                  <option value="PASIF">PASIF</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Değişiklik Nedeni (Zorunlu)</label>
                <textarea value={overrideReasonInput} onChange={(e) => setOverrideReasonInput(e.target.value)}
                  placeholder="Müşteri taahhüt iptali istedi, churn riski yüksek..."
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white text-sm h-24 outline-none resize-none" />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowSegmentModal(null)}
                className="px-5 py-3 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-semibold">İptal</button>
              <button onClick={handleOverrideSegment}
                className="px-6 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/20">
                Segmenti Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-3xl max-w-md w-full p-8 space-y-6">
            <div>
              <h3 className="text-xl font-black text-white">Vaka Durumu Değiştir</h3>
              <p className="text-xs text-slate-500 mt-1">
                Mevcut durum: <span className="text-turkcell-yellow font-bold">{showStatusModal.status}</span>
                {' → '}Geçerli hedef: <span className="text-emerald-400 font-bold">{(VALID_TRANSITIONS[showStatusModal.status] || []).join(', ') || 'Yok'}</span>
              </p>
            </div>

            {statusError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300 text-xs flex items-start space-x-2">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{statusError}</span>
              </div>
            )}

            <div className="flex items-center space-x-1 overflow-x-auto pb-2">
              {STATE_FLOW.map((state, i) => {
                const isCurrent = state === showStatusModal.status;
                const isTarget = (VALID_TRANSITIONS[showStatusModal.status] || []).includes(state);
                return (
                  <React.Fragment key={state}>
                    <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap border transition-all ${
                      isCurrent ? 'bg-turkcell-yellow/20 text-turkcell-yellow border-turkcell-yellow/30 scale-105' :
                      isTarget ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-pointer hover:scale-105' :
                      'bg-slate-800/50 text-slate-600 border-slate-700/30'
                    }`}>{state}</div>
                    {i < STATE_FLOW.length - 1 && <ChevronRight className="w-3 h-3 text-slate-700 shrink-0" />}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Optimizasyon Notu {(VALID_TRANSITIONS[showStatusModal.status] || []).includes('TAMAMLANDI') && <span className="text-rose-400">(Zorunlu)</span>}</label>
                <textarea value={statusNoteInput} onChange={(e) => setStatusNoteInput(e.target.value)}
                  placeholder="İndirim %25 olarak optimize edildi..."
                  className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white text-sm h-24 outline-none resize-none" />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowStatusModal(null)}
                className="px-5 py-3 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-semibold">İptal</button>
              {(VALID_TRANSITIONS[showStatusModal.status] || []).map((target) => (
                <button key={target} onClick={() => handleStatusChange(target)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-turkcell-yellow to-amber-500 text-turkcell-navy font-black text-xs shadow-lg shadow-amber-500/20">
                  {target}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-3xl max-w-lg w-full p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">Vaka Detayı</h3>
              <button onClick={() => setShowDetailModal(null)} className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-slate-500 mb-1">Vaka Kodu</div>
                <div className="font-mono text-turkcell-yellow font-bold">{showDetailModal.caseCode}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-slate-500 mb-1">Kampanya Türü</div>
                <div className="text-white font-semibold">{showDetailModal.campaignType}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-slate-500 mb-1">AI Skoru</div>
                <div className="text-turkcell-yellow font-bold">%{Math.round(showDetailModal.aiScore * 100)}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-slate-500 mb-1">İndirim Oranı</div>
                <div className="text-emerald-400 font-bold">%{showDetailModal.discountPercent}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-slate-500 mb-1">Atanan Uzman</div>
                <div className="text-white font-semibold">{showDetailModal.assignedExpert}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div className="text-slate-500 mb-1">SLA Süresi</div>
                <div className="text-white font-semibold">{SLA_HOURS[showDetailModal.priority]}h ({showDetailModal.priority})</div>
              </div>
            </div>
            {showDetailModal.optimizationNote && (
              <div className="p-3 rounded-xl bg-turkcell-yellow/10 border border-turkcell-yellow/15 text-xs text-turkcell-yellow">
                <span className="font-bold">Optimizasyon Notu:</span> {showDetailModal.optimizationNote}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
