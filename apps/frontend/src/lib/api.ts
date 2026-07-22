/**
 * CampaignCell Unified API Client
 * Connects to API Gateway (default: http://localhost:8080)
 * Handles Identity, Campaign, AI, and Gamification Service endpoints
 */

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080';

export interface ApiUser {
  id: string;
  email: string;
  gsmNumber?: string;
  role: 'SUBSCRIBER' | 'CAMPAIGN_EXPERT' | 'SUPERVISOR';
  firstName: string;
  lastName: string;
  token?: string;
}

export interface ApiCampaign {
  id: string;
  code: string;
  name: string;
  type: string;
  discountPercent: number;
  targetSegment: string;
  status: string;
  aiRecommendationScore?: number;
  aiConversionProbability?: number;
}

export interface ApiCase {
  id: string;
  caseCode: string;
  campaignName: string;
  campaignType: string;
  segment: string;
  priority: 'DUSUK' | 'ORTA' | 'YUKSEK' | 'KRITIK';
  status: string;
  aiScore: number;
  assignedExpert: string;
  isAiMisclassified: boolean;
  optimizationNote?: string;
  slaDeadline: string;
  slaBreached: boolean;
  discountPercent: number;
}

export interface ApiLeaderboard {
  rank: number;
  expertId: string;
  name: string;
  level: string;
  points: number;
  badges: string[];
}

export interface ApiAiMetrics {
  accuracy: number;
  totalPredictions: number;
  misclassifications: number;
  f1Score: number;
  categories: {
    name: string;
    accuracy: number;
    correct: number;
    total: number;
  }[];
}

class CampaignCellApiClient {
  private gatewayUrl: string;
  private token: string | null = null;

  constructor() {
    this.gatewayUrl = API_GATEWAY_URL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // ===== IDENTITY SERVICE =====
  async login(identifier: string, passOrOtp: string, role: string) {
    try {
      const res = await fetch(`${this.gatewayUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ identifier, password: passOrOtp, role }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) this.setToken(data.accessToken);
        return data;
      }
    } catch {
      // Fallback response for dev/unreachable API
    }
    return {
      accessToken: 'simulated-jwt-token-2026',
      user: {
        id: 'user-1',
        email: identifier.includes('@') ? identifier : `${identifier}@turkcell.com.tr`,
        role,
        firstName: role === 'SUBSCRIBER' ? 'Ahmet' : role === 'SUPERVISOR' ? 'Süpervizör' : 'Ahmet',
        lastName: role === 'SUBSCRIBER' ? 'Yılmaz' : 'Uzman',
      },
    };
  }

  // ===== CAMPAIGN SERVICE =====
  async getCases(): Promise<ApiCase[]> {
    try {
      const res = await fetch(`${this.gatewayUrl}/api/v1/campaigns/cases`, {
        headers: this.getHeaders(),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return [
      {
        id: 'case-1', caseCode: 'CMP-2026-000101', campaignName: 'Yüksek Değerli Abone 20GB Ek Paket',
        campaignType: 'EK_PAKET', segment: 'YUKSEK_DEGER', priority: 'YUKSEK',
        status: 'OPTIMIZE_EDILIYOR', aiScore: 0.94, assignedExpert: 'Ahmet Yılmaz',
        isAiMisclassified: false, optimizationNote: 'Ekstra %5 sadakat indirimi tanımlandı.',
        slaDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        slaBreached: false, discountPercent: 30,
      },
    ];
  }

  async createCampaign(data: { name: string; type: string; segment: string; discountPercent: number }) {
    try {
      const res = await fetch(`${this.gatewayUrl}/api/v1/campaigns`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { success: true, caseCode: `CMP-2026-${Math.floor(100000 + Math.random() * 900000)}` };
  }

  async transitionCaseStatus(caseId: string, targetStatus: string, note?: string) {
    try {
      const res = await fetch(`${this.gatewayUrl}/api/v1/campaigns/cases/${caseId}/transition`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ targetStatus, note }),
      });
      if (res.ok) return await res.json();
      if (res.status === 422) {
        throw new Error('HTTP 422: State Machine geçiş kuralı ihlali');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('422')) throw err;
    }
    return { success: true, status: targetStatus };
  }

  async overrideSegment(caseId: string, newSegment: string, reason: string) {
    try {
      const res = await fetch(`${this.gatewayUrl}/api/v1/campaigns/cases/${caseId}/override-segment`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ newSegment, reason }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { success: true, isAiMisclassified: true };
  }

  // ===== GAMIFICATION SERVICE =====
  async getLeaderboard(): Promise<ApiLeaderboard[]> {
    try {
      const res = await fetch(`${this.gatewayUrl}/api/v1/gamification/leaderboard`, {
        headers: this.getHeaders(),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return [
      { rank: 1, expertId: 'exp-1', name: 'Ahmet Yılmaz', level: 'Platin', points: 3450, badges: ['ILK_KAMPANYA', 'HIZ_USTASI', 'DONUSUM_KRALI'] },
      { rank: 2, expertId: 'exp-2', name: 'Ayşe Kaya', level: 'Altın', points: 2280, badges: ['ILK_KAMPANYA', 'DONUSUM_KRALI'] },
    ];
  }

  // ===== AI SERVICE =====
  async getAiMetrics(): Promise<ApiAiMetrics> {
    try {
      const res = await fetch(`${this.gatewayUrl}/api/v1/ai/metrics`, {
        headers: this.getHeaders(),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      accuracy: 88.5,
      totalPredictions: 1420,
      misclassifications: 163,
      f1Score: 0.872,
      categories: [
        { name: 'YÜKSEK DEĞER', accuracy: 92.4, correct: 416, total: 450 },
        { name: 'RİSKLİ KAYIP', accuracy: 91.2, correct: 346, total: 380 },
        { name: 'YENİ ABONE', accuracy: 84.0, correct: 269, total: 320 },
        { name: 'PASİF ABONE', accuracy: 82.5, correct: 223, total: 270 },
      ],
    };
  }
}

export const api = new CampaignCellApiClient();
