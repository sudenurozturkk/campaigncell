# CampaignCell

**Turkcell Kişiselleştirilmiş Kampanya ve Öneri Platformu**
*"Doğru Teklif. Doğru Müşteri. Doğru Zaman."*

AI-Powered Campaign Intelligence platform built for Turkcell CodeNight 2026 Final Case.
CampaignCell analyzes subscriber behavior to recommend the right campaign to the right
subscriber at the right time, and manages the full optimization lifecycle: scoring →
segmentation → expert assignment → A/B testing → conversion tracking → gamification.

> **Status:** Phase 1–2 complete (architecture + working infrastructure skeleton).
> Business logic for each service ships in Phases 3–6. See roadmap below.

## Architecture

4 independent microservices, each with its own PostgreSQL database, behind a single API
Gateway, communicating asynchronously over RabbitMQ. Full diagram and rules:
[`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

```
Frontend → API Gateway → { Identity | Campaign | AI | Gamification } Service
                              each with its own DB, connected via RabbitMQ events
```

| Service | Port | Tech | DB |
|---|---|---|---|
| frontend | 3000 | Next.js (placeholder in this phase) | — |
| api-gateway | 8080 | Node/Express | — |
| identity-service | 3001 | NestJS (stub in this phase) | identity-db :5433 |
| campaign-service | 3002 | NestJS (stub in this phase) | campaign-db :5434 |
| ai-service | 8000 | FastAPI (stub in this phase) | ai-db :5435 |
| gamification-service | 3003 | NestJS (stub in this phase) | gamification-db :5436 |
| rabbitmq | 5672 / 15672 (UI) | RabbitMQ | — |

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

Once healthy:
- Frontend placeholder: http://localhost:3000
- API Gateway: http://localhost:8080
- Identity Service: http://localhost:3001/health
- Campaign Service: http://localhost:3002/health
- AI Service: http://localhost:8000/health
- Gamification Service: http://localhost:3003/health
- RabbitMQ Management UI: http://localhost:15672 (user/pass from `.env`)

Every service currently exposes only `GET /health` and `GET /` — this phase proves the
whole ecosystem boots with one command and every container reports healthy, per the
case's mandatory requirement ("docker compose up ile sistem ayağa kalkmıyorsa
değerlendirme dışıdır"). Real endpoints land in Phases 3–8.

## Roles

| Rol | Açıklama |
|---|---|
| Abone (Subscriber) | Kişiselleştirilmiş teklifleri görür, kabul/ret eder, geri bildirim verir |
| Kampanya Uzmanı (Campaign Expert) | Kampanya oluşturur, optimizasyon vakalarını yönetir, rozet kazanır |
| Kampanya Yöneticisi (Supervisor) | Analitik dashboard, AI doğruluğu, manuel atama |
| Admin | Personel hesabı yönetimi, rol atama, audit log |

## Documentation

- [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) — mimari, diyagram, degradation stratejisi, phase roadmap
- [`docs/architecture/DATABASE_DESIGN.md`](docs/architecture/DATABASE_DESIGN.md) — 4 bağımsız DB şeması
- [`docs/EVENTS.md`](docs/EVENTS.md) — RabbitMQ event kataloğu
- [`docs/AI_APPROACH.md`](docs/AI_APPROACH.md) — AI yaklaşımı (Phase 5'te detaylandırılacak)
- [`docs/SECURITY.md`](docs/SECURITY.md) — güvenlik önlemleri (Phase 11'de detaylandırılacak)

## Roadmap

See the phase table in `docs/architecture/ARCHITECTURE.md#7-phase-roadmap`. Each phase
ships working, testable code before the next one begins — no phase is skipped.

## Demo Users (to be seeded in Phase 5–6)

Will be populated by `scripts/seed/` once Identity Service (Phase 3) exists — 100+
subscribers, 20+ campaigns, 10+ experts, 4+ supervisors/admins, all synthetic Turkish data.
