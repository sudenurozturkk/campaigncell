'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Phone, ArrowRight, ShieldCheck, UserCheck, Cpu, BarChart3, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'SUBSCRIBER' | 'CAMPAIGN_EXPERT' | 'SUPERVISOR'>('CAMPAIGN_EXPERT');
  const [identifier, setIdentifier] = useState('uzman@turkcell.com.tr');
  const [password, setPassword] = useState('Turkcell2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (role === 'SUBSCRIBER') {
      router.push('/dashboard/subscriber');
    } else if (role === 'SUPERVISOR') {
      router.push('/dashboard/supervisor');
    } else {
      router.push('/dashboard/expert');
    }
  };

  const roles = [
    {
      key: 'SUBSCRIBER' as const,
      label: 'Abone',
      icon: UserCheck,
      desc: 'GSM + OTP ile giriş',
      color: 'blue',
      defaultId: '0555 111 22 33',
    },
    {
      key: 'CAMPAIGN_EXPERT' as const,
      label: 'Uzman',
      icon: Cpu,
      desc: 'E-posta + Şifre',
      color: 'amber',
      defaultId: 'uzman@turkcell.com.tr',
    },
    {
      key: 'SUPERVISOR' as const,
      label: 'Süpervizör',
      icon: BarChart3,
      desc: 'E-posta + Şifre',
      color: 'purple',
      defaultId: 'supervisor@turkcell.com.tr',
    },
  ];

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-turkcell-yellow via-amber-400 to-turkcell-blue flex items-center justify-center font-black text-turkcell-navy text-2xl shadow-lg shadow-turkcell-yellow/25 group-hover:scale-105 transition-transform">
              CC
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold text-white">
                Campaign<span className="text-turkcell-yellow">Cell</span>
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-slate-500">
                Platform Girişi
              </span>
            </div>
          </Link>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-8 space-y-8">
          {/* Role Selector */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
              Giriş Rolü Seçin
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setRole(r.key);
                    setIdentifier(r.defaultId);
                  }}
                  className={`relative p-3.5 rounded-xl border transition-all duration-300 text-center space-y-2 group ${
                    role === r.key
                      ? r.color === 'blue'
                        ? 'bg-blue-500/15 border-blue-500/40 shadow-lg shadow-blue-500/10'
                        : r.color === 'amber'
                        ? 'bg-turkcell-yellow/15 border-turkcell-yellow/40 shadow-lg shadow-turkcell-yellow/10'
                        : 'bg-purple-500/15 border-purple-500/40 shadow-lg shadow-purple-500/10'
                      : 'border-slate-800 hover:border-slate-600 bg-slate-900/50'
                  }`}
                >
                  <r.icon
                    className={`w-5 h-5 mx-auto transition-colors ${
                      role === r.key
                        ? r.color === 'blue'
                          ? 'text-blue-400'
                          : r.color === 'amber'
                          ? 'text-turkcell-yellow'
                          : 'text-purple-400'
                        : 'text-slate-500'
                    }`}
                  />
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        role === r.key ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {r.label}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{r.desc}</div>
                  </div>
                  {role === r.key && (
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                        r.color === 'blue'
                          ? 'bg-blue-400'
                          : r.color === 'amber'
                          ? 'bg-turkcell-yellow'
                          : 'bg-purple-400'
                      } badge-pulse`}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                {role === 'SUBSCRIBER' ? 'GSM Numarası' : 'E-Posta Adresi'}
              </label>
              <div className="relative">
                {role === 'SUBSCRIBER' ? (
                  <Phone className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                ) : (
                  <Mail className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                )}
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-turkcell-yellow/60 focus:ring-1 focus:ring-turkcell-yellow/20 transition-all placeholder:text-slate-600"
                  placeholder={role === 'SUBSCRIBER' ? '0555 XXX XX XX' : 'email@turkcell.com.tr'}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                {role === 'SUBSCRIBER' ? 'OTP Kodu (Simüle: 1234)' : 'Parola'}
              </label>
              <div className="relative">
                <Lock className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-white text-sm focus:outline-none focus:border-turkcell-yellow/60 focus:ring-1 focus:ring-turkcell-yellow/20 transition-all placeholder:text-slate-600"
                  placeholder={role === 'SUBSCRIBER' ? '1234' : '••••••••'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-turkcell-yellow via-amber-400 to-turkcell-gold text-turkcell-navy font-black text-sm hover:opacity-90 hover:scale-[1.01] transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl shadow-turkcell-yellow/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-turkcell-navy/30 border-t-turkcell-navy rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {role === 'SUBSCRIBER'
                      ? 'Abone Portalına Giriş'
                      : role === 'SUPERVISOR'
                      ? 'Süpervizör Paneline Giriş'
                      : 'Uzman Paneline Giriş'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Info */}
          <div className="p-4 bg-blue-500/8 border border-blue-500/15 rounded-xl flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-blue-300 font-semibold">JWT Authentication & RBAC Koruması</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Access Token (15dk) + Refresh Token Rotation (7gün). 5 başarısız girişte hesap 15dk kilitlenir.
                Bcrypt hash, token theft detection aktif.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-turkcell-yellow transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
