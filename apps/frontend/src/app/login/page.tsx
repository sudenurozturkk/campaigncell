'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'SUBSCRIBER' | 'CAMPAIGN_EXPERT' | 'SUPERVISOR'>('CAMPAIGN_EXPERT');
  const [email, setEmail] = useState('uzman@turkcell.com.tr');
  const [password, setPassword] = useState('password123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'SUBSCRIBER') {
      router.push('/dashboard/subscriber');
    } else if (role === 'SUPERVISOR') {
      router.push('/dashboard/supervisor');
    } else {
      router.push('/dashboard/expert');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-turkcell-darkBg via-[#0C1222] to-turkcell-darkBg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-turkcell-yellow to-turkcell-blue flex items-center justify-center font-bold text-turkcell-navy text-2xl shadow-lg shadow-turkcell-yellow/20">
              CC
            </div>
            <span className="text-2xl font-bold text-white">Campaign<span className="text-turkcell-yellow">Cell</span></span>
          </Link>
          <p className="text-slate-400 text-sm mt-2">Platform Girişi & Rol Seçimi</p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card rounded-2xl p-8 space-y-6">
          {/* Role Tabs */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Giriş Yapılacak Rol</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setRole('SUBSCRIBER');
                  setEmail('05551112233');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === 'SUBSCRIBER' ? 'bg-turkcell-blue text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Abone
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('CAMPAIGN_EXPERT');
                  setEmail('uzman@turkcell.com.tr');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === 'CAMPAIGN_EXPERT' ? 'bg-turkcell-yellow text-turkcell-navy shadow font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Uzman
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('SUPERVISOR');
                  setEmail('supervisor@turkcell.com.tr');
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  role === 'SUPERVISOR' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Süpervizör
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {role === 'SUBSCRIBER' ? 'GSM Numarası' : 'E-Posta Adresi'}
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-turkcell-yellow transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Parola / Şifre</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-turkcell-yellow transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 rounded-xl bg-gradient-to-r from-turkcell-yellow to-amber-500 text-turkcell-navy font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
            >
              <span>{role === 'SUBSCRIBER' ? 'Abone Paneline Giriş' : role === 'SUPERVISOR' ? 'Süpervizör Paneline Giriş' : 'Uzman Paneline Giriş'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center space-x-3 text-xs text-blue-300">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
            <span>JWT Auth & RBAC (Role-Based Access Control) koruması aktiftir.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
