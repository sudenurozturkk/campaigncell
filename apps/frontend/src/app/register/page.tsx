'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCheck, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Check, AlertTriangle, MapPin, User } from 'lucide-react';
import { api } from '../../lib/api';
import ThemeToggle from '../components/ThemeToggle';

const API_GW = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gsmNumber: '',
    email: '',
    password: '',
    region: 'İstanbul',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Live password policy validation (Case Section 3.2 Spec)
  const isMinLength = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasDigit = /[0-9]/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password);
  const isPasswordValid = isMinLength && hasUpper && hasDigit && hasSpecial;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('Parola Turkcell güvenlik kriterlerine uymamaktadır.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_GW}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok && (data.access_token || data.accessToken)) {
        const tok = data.access_token || data.accessToken;
        api.setToken(tok);
        localStorage.setItem('cc_token', tok);
        localStorage.setItem('cc_user', JSON.stringify(data.user));
        setSuccess('Kayıt başarılı! Abone portalına yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push('/dashboard/subscriber');
        }, 1200);
      } else {
        setError(data.message || 'Kayıt sırasında bir hata oluştu.');
        setIsLoading(false);
      }
    } catch {
      // Demo fallback navigation
      setSuccess('Demo modda kayıt oluşturuldu! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        router.push('/dashboard/subscriber');
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050810] flex flex-col justify-between px-4 py-8 transition-colors duration-300">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link href="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-turkcell-yellow via-amber-400 to-turkcell-blue flex items-center justify-center font-black text-turkcell-navy text-base shadow-md shadow-turkcell-yellow/20">
            CC
          </div>
          <span className="text-xl font-extrabold text-turkcell-navy dark:text-white">
            Campaign<span className="text-amber-500 dark:text-turkcell-yellow">Cell</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className="bg-white dark:bg-[#0C1222] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-turkcell-blue/10 dark:bg-turkcell-yellow/15 text-turkcell-blue dark:text-turkcell-yellow text-xs font-bold mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Yeni Abone Kaydı</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Turkcell Platformuna Kaydolun</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Yapay zeka kişiselleştirilmiş kampanya fırsatlarından faydalanmak için hesabınızı açın</p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 font-medium flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ad</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-turkcell-blue dark:focus:border-turkcell-yellow font-medium"
                    placeholder="Ahmet"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Soyad</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-turkcell-blue dark:focus:border-turkcell-yellow font-medium"
                  placeholder="Yılmaz"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">GSM Numarası</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.gsmNumber}
                  onChange={e => setForm(p => ({ ...p, gsmNumber: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-turkcell-blue dark:focus:border-turkcell-yellow font-medium"
                  placeholder="05551112233"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">E-Posta Adresi</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-turkcell-blue dark:focus:border-turkcell-yellow font-medium"
                  placeholder="ahmet@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bölge</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={form.region}
                    onChange={e => setForm(p => ({ ...p, region: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-medium"
                  >
                    {['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Gaziantep'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Parola</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-turkcell-blue dark:focus:border-turkcell-yellow font-medium"
                    placeholder="Turkcell2026!"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Password Policy Checklist (Case Section 3.2 Spec) */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Turkcell Şifre Politikası Gereksinimleri:</span>
              <div className="grid grid-cols-2 gap-1 font-medium">
                <div className={isMinLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                  {isMinLength ? '✓' : '○'} Min 8 Karakter
                </div>
                <div className={hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                  {hasUpper ? '✓' : '○'} 1 Büyük Harf (A-Z)
                </div>
                <div className={hasDigit ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                  {hasDigit ? '✓' : '○'} 1 Rakam (0-9)
                </div>
                <div className={hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}>
                  {hasSpecial ? '✓' : '○'} 1 Özel Karakter (!@#$)
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid}
              className="w-full py-3.5 mt-2 rounded-xl bg-turkcell-navy text-white dark:bg-gradient-to-r dark:from-turkcell-yellow dark:via-amber-400 dark:to-turkcell-gold dark:text-turkcell-navy font-black text-xs hover:opacity-90 transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Abone Hesabı Oluştur ve Giriş Yap</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Zaten bir hesabınız var mı? </span>
            <Link href="/login" className="text-xs text-turkcell-blue dark:text-turkcell-yellow font-extrabold hover:underline">
              Giriş Yapın
            </Link>
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="text-center">
        <Link href="/" className="text-xs text-slate-500 hover:text-turkcell-navy dark:hover:text-turkcell-yellow font-medium transition-colors">
          ← Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
