'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, User, Gift, History, LogOut, ChevronLeft, ChevronRight,
  Cpu, Layers, Trophy, BarChart3, Archive, Settings, Bell,
  UserCheck, Timer, Brain, Menu, X
} from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface DashboardShellProps {
  children: React.ReactNode;
  role: 'subscriber' | 'expert' | 'supervisor';
  userName: string;
  userDetail: string;
}

const ROLE_CONFIG = {
  subscriber: {
    label: 'Abone Portalı',
    color: 'blue',
    badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    links: [
      { href: '/dashboard/subscriber', label: 'Fırsatlarım', icon: Gift, badge: '3' },
      { href: '/dashboard/subscriber/profile', label: 'Profilim', icon: User },
      { href: '/dashboard/subscriber/history', label: 'Teklif Geçmişi', icon: History },
    ] as SidebarLink[],
  },
  expert: {
    label: 'Kampanya Uzmanı',
    color: 'amber',
    badgeBg: 'bg-turkcell-yellow/15 text-turkcell-yellow border-turkcell-yellow/20',
    links: [
      { href: '/dashboard/expert', label: 'Vakalarım', icon: Layers, badge: '3' },
      { href: '/dashboard/expert/profile', label: 'Performansım', icon: Trophy },
      { href: '/dashboard/expert/archive', label: 'Kampanya Arşivi', icon: Archive },
    ] as SidebarLink[],
  },
  supervisor: {
    label: 'Süpervizör',
    color: 'purple',
    badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
    links: [
      { href: '/dashboard/supervisor', label: 'Genel Bakış', icon: BarChart3 },
      { href: '/dashboard/supervisor', label: 'Liderlik Tablosu', icon: Trophy },
      { href: '/dashboard/supervisor', label: 'AI Doğruluk', icon: Brain },
      { href: '/dashboard/supervisor', label: 'SLA İzleme', icon: Timer },
    ] as SidebarLink[],
  },
};

export default function DashboardShell({ children, role, userName, userDetail }: DashboardShellProps) {
  const pathname = usePathname();
  const config = ROLE_CONFIG[role];
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = userName.split(' ').map((w) => w[0]).join('').slice(0, 2);

  return (
    <div className="min-h-screen hero-gradient text-slate-100 flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col border-r border-white/5 bg-[#050810]/95 backdrop-blur-xl transition-all duration-300
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-white/5 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-turkcell-yellow via-amber-400 to-turkcell-blue flex items-center justify-center font-black text-turkcell-navy text-sm shadow-lg shadow-turkcell-yellow/20 shrink-0">
              CC
            </div>
            {!collapsed && (
              <span className="text-base font-bold text-white group-hover:text-turkcell-yellow transition-colors">
                Campaign<span className="text-turkcell-yellow">Cell</span>
              </span>
            )}
          </Link>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-500 hover:text-white transition-all hidden md:block">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-500 hover:text-white transition-all md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div className="px-4 py-3">
            <span className={`inline-flex px-2.5 py-1.5 rounded-lg text-[10px] font-bold border ${config.badgeBg}`}>
              {config.label}
            </span>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {config.links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-turkcell-yellow/10 text-turkcell-yellow border border-turkcell-yellow/15'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
                title={collapsed ? link.label : undefined}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-turkcell-yellow' : ''}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{link.label}</span>
                    {link.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-turkcell-yellow/20 text-turkcell-yellow text-[10px] font-bold">
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Expand Button (collapsed) */}
        {collapsed && (
          <div className="px-3 py-2">
            <button onClick={() => setCollapsed(false)} className="w-full p-2.5 rounded-xl hover:bg-slate-800/40 text-slate-500 hover:text-white transition-all flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className={`border-t border-white/5 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className={`flex items-center space-x-3 p-2.5 rounded-xl bg-slate-900/40 ${collapsed ? 'p-2' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-turkcell-blue/30 to-turkcell-yellow/20 border border-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{userName}</div>
                <div className="text-[10px] text-slate-500 truncate">{userDetail}</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <Link
              href="/"
              className="flex items-center space-x-2 mt-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Çıkış Yap</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}>
        {/* Top Bar (Mobile) */}
        <div className="md:hidden sticky top-0 z-30 border-b border-white/5 bg-[#050810]/90 backdrop-blur-xl px-4 h-14 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl bg-slate-800/60 text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-white">CampaignCell</span>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-turkcell-blue/30 to-turkcell-yellow/20 border border-white/10 flex items-center justify-center text-white text-[10px] font-bold">
            {initials}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
