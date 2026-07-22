import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CampaignCell — AI-Powered Personalized Campaign Platform',
  description: 'Turkcell CodeNight 2026 Final — AI Tabanlı Kişiselleştirilmiş Kampanya ve Öneri Platformu',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="bg-turkcell-darkBg text-slate-100 min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
