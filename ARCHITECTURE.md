# CampaignCell — System Architecture

**Doğru Teklif. Doğru Müşteri. Doğru Zaman.**
AI-Powered Personalized Campaign & Recommendation Platform — Turkcell CodeNight 2026 Final

---

## 1. Genel Bakış

CampaignCell, tek bir monolith uygulama değil, birbiriyle olay-tabanlı (event-driven) ve REST
üzerinden haberleşen **4 bağımsız mikroservis + 1 API Gateway + 1 Frontend + 1 Message Broker**
ekosisteminden oluşur.

Temel tasarım ilkesi: **her servis kendi veritabanına sahiptir ve bağımsız çöker/ayağa kalkar.**
AI Service kapansa dahi Campaign Service çalışmaya devam etmeli, kampanya oluşturma asla
başarısız olmamalıdır (bkz. §5 Degradation Stratejisi).

## 2. Bileşenler ve Sorumluluklar

| Bileşen | Sorumluluk | Teknoloji |
|---|---|---|
| Frontend | Abone / Uzman / Süpervizör / Admin arayüzleri | Next.js 15, TypeScript, Tailwind, shadcn/ui |
| API Gateway | Tek giriş noktası: routing, JWT doğrulama, rate limiting, correlation-id | Node.js / Express (custom reverse proxy) |
| Identity Service | Kayıt, login, JWT + refresh token rotation, RBAC, audit log, hesap kilitleme | NestJS + PostgreSQL |
| Campaign Service | Kampanya CRUD, optimizasyon vakası state machine, SLA takibi, A/B test | NestJS + PostgreSQL |
| AI Service | Öneri skorlama, dönüşüm tahmini, segment sınıflandırma, uzman atama | Python + FastAPI + scikit-learn |
| Gamification Service | Puan, rozet, seviye, liderlik — sadece event ile tetiklenir | NestJS + PostgreSQL |
| Message Broker | Servisler arası asenkron event iletimi | RabbitMQ |

## 3. Mimari Diyagram

```
                         ┌───────────────────────────┐
                         │   CAMPAIGNCELL FRONTEND    │
                         │   (Next.js Web Platform)   │
                         └─────────────┬─────────────┘
                                       │ HTTPS
                                       ▼
                         ┌───────────────────────────┐
                         │        API GATEWAY         │
                         │ JWT Verify / Routing /     │
                         │ Rate Limit / Correlation-ID│
                         └─────────────┬─────────────┘
                                       │
          ┌────────────────┬──────────┼──────────┬────────────────┐
          ▼                ▼          ▼          ▼                ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    (async only)
   │  IDENTITY   │  │  CAMPAIGN   │  │     AI      │        │
   │  SERVICE    │  │  SERVICE    │  │  SERVICE    │        │
   │  (NestJS)   │  │  (NestJS)   │  │  (FastAPI)  │        │
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
          ▼                ▼                ▼                │
     identity-db      campaign-db        ai-db                │
          │                │                │                 │
          │                └──────┬─────────┘                 │
          │                       ▼                           │
          │              ┌─────────────────┐                  │
          │              │    RABBITMQ     │◄─────────────────┘
          │              │ (event broker)  │
          │              └────────┬────────┘
          │                       ▼
          │              ┌─────────────────┐
          │              │  GAMIFICATION   │
          │              │     SERVICE     │
          │              └────────┬────────┘
          │                       ▼
          │              gamification-db
          ▼
     Audit Logs (identity-db içinde, cross-cutting)
```

## 4. Mimari Kurallar (Non-negotiable)

1. **Database-per-service.** Hiçbir servis başka bir servisin veritabanına doğrudan erişemez.
   Cross-service foreign key YOKTUR — ilişkiler sadece ID referansı ile tutulur
   (örn. `campaigns.assigned_expert_id` sadece bir UUID'dir, identity-db'de FK değildir).
2. **İletişim kanalları:**
   - **Senkron (REST):** Campaign Service → AI Service (`POST /api/v1/ai/recommend`),
     API Gateway → tüm servisler.
   - **Asenkron (RabbitMQ):** Campaign Service ↔ Gamification Service, SLA/segment event'leri,
     AI prediction correction event'leri. Bkz. `docs/EVENTS.md`.
3. **Loose coupling:** Campaign Service, Gamification Service'i asla doğrudan çağırmaz —
   sadece event yayınlar (`campaign.optimized` vb.). Gamification Service o event'i dinler.
4. **Bağımsız hata toleransı (graceful degradation):**
   - AI Service down → Campaign Service kampanya oluşturmaya devam eder;
     `segment=BELIRSIZ`, `priority=ORTA`, `status=MANUAL_OPTIMIZATION_REQUIRED` ile fallback.
   - Gamification Service down → Campaign Service optimizasyonu tamamlamaya devam eder;
     event RabbitMQ'da kuyruklanır, servis ayağa kalkınca işlenir (durable queue).
   - Her REST-arası çağrıda timeout + circuit breaker mantığı (basit retry + fallback) uygulanır.
5. **API Gateway tek giriş noktasıdır.** Servisler birbirine veya dışarıya doğrudan port
   açmamalıdır (prod ortamında); dev ortamında debug için portlar Docker Compose'da açık
   bırakılmıştır.
6. **Stateless servisler.** JWT doğrulama her istekte yapılır, oturum sunucuda tutulmaz.

## 5. Degradation Stratejisi (AI Service Failure)

```
Campaign Create Request
        │
        ▼
Campaign Service → AI Service çağrısı (timeout: 3s)
        │
   ┌────┴────┐
   ▼         ▼
 Başarılı   Başarısız / Timeout
   │             │
   ▼             ▼
AI sonucu    segment = BELIRSIZ
kampanyaya   priority = ORTA
eklenir      status = MANUAL_OPTIMIZATION_REQUIRED
   │             │
   │        Frontend: "AI Optimization Service is currently
   │        unavailable. Campaign created successfully and
   │        queued for manual optimization."
   │             │
   └──────┬──────┘
          ▼
   Kampanya HER ZAMAN oluşturulur (asla request reddedilmez)
          │
          ▼
AI Service tekrar açıldığında: manuel kuyruktaki (BELIRSIZ)
kampanyalar otomatik olarak yeniden AI analizine gönderilir
(polling job veya `ai.service.recovered` event'i ile).
```

## 6. Klasör Yapısı

```
campaigncell/
├── apps/
│   └── frontend/                 # Next.js — Phase 9
├── services/
│   ├── api-gateway/              # Phase 8
│   ├── identity-service/         # Phase 3
│   ├── campaign-service/         # Phase 4
│   ├── ai-service/                # Phase 5
│   └── gamification-service/     # Phase 6
├── infrastructure/
│   ├── docker/                    # ortak Dockerfile parçaları / init scriptleri
│   └── rabbitmq/                  # exchange/queue tanım dosyaları
├── docs/
│   ├── architecture/
│   │   ├── ARCHITECTURE.md        # bu dosya
│   │   └── DATABASE_DESIGN.md
│   ├── EVENTS.md
│   ├── AI_APPROACH.md
│   └── SECURITY.md
├── scripts/
│   ├── seed/                      # demo veri yükleme scriptleri
│   └── generate-data/             # sentetik dataset üretim scriptleri
├── docker-compose.yml
├── README.md
└── .env.example
```

## 7. Phase Roadmap

| Phase | İçerik | Durum |
|---|---|---|
| 1 | Architecture, folder structure | ✅ Bu teslimat |
| 2 | Infrastructure (Docker Compose, Postgres, RabbitMQ, healthchecks) | ✅ Bu teslimat (stub servislerle çalışır durumda) |
| 3 | Identity Service (auth, JWT, RBAC, audit log) | ⏳ Sırada |
| 4 | Campaign Service (CRUD, state machine, SLA) | ⏳ |
| 5 | AI Service (dataset, training, scoring, assignment) | ⏳ |
| 6 | Gamification Service (puan, rozet, leaderboard) | ⏳ |
| 7 | RabbitMQ event akışı (publisher/consumer implementasyonu) | ⏳ |
| 8 | API Gateway (routing, auth, rate limit, correlation-id) | ⏳ |
| 9 | Frontend (landing, login, subscriber/expert/supervisor UI) | ⏳ |
| 10 | Supervisor Center (analytics, AI accuracy) | ⏳ |
| 11 | Security hardening | ⏳ |
| 12 | Testing (unit/integration/security/E2E) | ⏳ |
| 13 | Documentation finalize | ⏳ |
| 14 | Final demo rehearsal | ⏳ |

Her phase tamamlanmadan bir sonrakine geçilmeyecektir.
