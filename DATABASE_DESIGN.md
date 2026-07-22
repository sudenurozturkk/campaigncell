# CampaignCell — Database Design (Database-per-Service)

Her mikroservisin kendi PostgreSQL veritabanı vardır. **Cross-service foreign key kullanılmaz.**
Servisler arası ilişkiler yalnızca UUID referansı ile tutulur (örn. `expert_id`, `subscriber_id`).
ORM: Prisma (Node servisleri) / SQLAlchemy (AI servisi).

---

## 1. IDENTITY-DB

```sql
-- users: hem abone (subscriber) hem personel (expert/supervisor/admin) tek tabloda, role ile ayrılır
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role              VARCHAR(20) NOT NULL CHECK (role IN ('SUBSCRIBER','CAMPAIGN_EXPERT','SUPERVISOR','ADMIN')),
  gsm_number        VARCHAR(15) UNIQUE,          -- SUBSCRIBER için zorunlu
  email             VARCHAR(255) UNIQUE,         -- personel için zorunlu
  password_hash     VARCHAR(255),                -- personel; argon2/bcrypt. Abone OTP kullanır, hash yok.
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  expertise_tags    TEXT[],                       -- örn: {CHURN_PREVENTION, DEVICE_UPSELL}
  region            VARCHAR(100),
  is_locked         BOOLEAN NOT NULL DEFAULT false,
  locked_until      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(30) UNIQUE NOT NULL,
  description   TEXT
);

CREATE TABLE permissions (
  id            SERIAL PRIMARY KEY,
  role_id       INT REFERENCES roles(id),
  resource      VARCHAR(100) NOT NULL,   -- örn: "campaigns:create"
  action        VARCHAR(30) NOT NULL     -- örn: "CREATE","READ","UPDATE","OVERRIDE"
);

CREATE TABLE refresh_tokens (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  token_hash        VARCHAR(255) NOT NULL,
  is_revoked        BOOLEAN NOT NULL DEFAULT false,
  replaced_by_id    UUID,               -- rotation zinciri
  expires_at        TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID,                  -- kim
  action        VARCHAR(100) NOT NULL, -- ne (örn: LOGIN_FAILED, ROLE_CHANGED, UNAUTHORIZED_ACCESS)
  resource_id   VARCHAR(100),          -- ilgili kaynak id
  ip_address    VARCHAR(45),           -- nereden
  result        VARCHAR(20) NOT NULL,  -- SUCCESS / FAILURE
  detail        JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now() -- ne zaman
);

CREATE TABLE login_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id),
  ip_address    VARCHAR(45),
  success       BOOLEAN NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 2. CAMPAIGN-DB

```sql
CREATE TABLE campaigns (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                  VARCHAR(20) UNIQUE NOT NULL,  -- CMP-2026-000123
  name                  VARCHAR(200) NOT NULL,
  description           TEXT,
  type                  VARCHAR(30) NOT NULL CHECK (type IN ('EK_PAKET','TARIFE_YUKSELTME','CIHAZ_FIRSATI','SADAKAT')),
  discount_percent      NUMERIC(5,2),
  target_segment        VARCHAR(20) CHECK (target_segment IN ('YUKSEK_DEGER','RISKLI_KAYIP','YENI_ABONE','PASIF','BELIRSIZ')),
  start_date            DATE,
  end_date              DATE,
  status                VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  ai_recommendation_score  NUMERIC(4,3),
  ai_conversion_probability NUMERIC(4,3),
  created_by            UUID NOT NULL,   -- users.id (identity-db, ID-only reference)
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE optimization_cases (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_code            VARCHAR(20) UNIQUE NOT NULL,   -- CMP-2026-000123 (case bazlı)
  campaign_id          UUID NOT NULL REFERENCES campaigns(id),
  segment              VARCHAR(20) NOT NULL,
  priority             VARCHAR(10) NOT NULL CHECK (priority IN ('DUSUK','ORTA','YUKSEK','KRITIK')),
  status               VARCHAR(30) NOT NULL DEFAULT 'YENI'
                        CHECK (status IN ('YENI','ATANDI','OPTIMIZE_EDILIYOR','TEST_EDILIYOR',
                                           'TAMAMLANDI','YAYINDA','ARSIVLENDI')),
  assigned_expert_id   UUID,             -- users.id (ID-only)
  ai_score             NUMERIC(4,3),
  ai_conversion_prob   NUMERIC(4,3),
  ai_reasoning         TEXT,
  is_ai_misclassified  BOOLEAN NOT NULL DEFAULT false,
  optimization_note    TEXT,             -- TAMAMLANDI'ya geçiş için zorunlu
  sla_deadline         TIMESTAMPTZ NOT NULL,
  sla_breached         BOOLEAN NOT NULL DEFAULT false,
  conversion_lift      NUMERIC(5,3),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_at          TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ
);

CREATE TABLE campaign_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id         UUID NOT NULL REFERENCES optimization_cases(id),
  expert_id       UUID NOT NULL,
  assignment_score NUMERIC(4,3),        -- expertise*0.5 + availability*0.3 + performance*0.2
  assigned_by     VARCHAR(20) NOT NULL CHECK (assigned_by IN ('AI','SUPERVISOR')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE segments (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(20) UNIQUE NOT NULL,
  description   TEXT
);

CREATE TABLE campaign_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id       UUID NOT NULL REFERENCES optimization_cases(id),
  from_status   VARCHAR(30),
  to_status     VARCHAR(30) NOT NULL,
  changed_by    UUID,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ab_test_experiments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id             UUID NOT NULL REFERENCES optimization_cases(id),
  variant_a_desc      TEXT,
  variant_b_desc      TEXT,
  variant_a_conversion NUMERIC(4,3),
  variant_b_conversion NUMERIC(4,3),
  winner              VARCHAR(1) CHECK (winner IN ('A','B')),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at            TIMESTAMPTZ
);

CREATE TABLE subscriber_feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID NOT NULL REFERENCES campaigns(id),
  subscriber_id   UUID NOT NULL,          -- users.id (ID-only)
  response        VARCHAR(20) NOT NULL CHECK (response IN ('ACCEPTED','REJECTED')),
  rejection_reason TEXT,
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 3. AI-DB

```sql
CREATE TABLE subscriber_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id         UUID NOT NULL,     -- identity-db users.id (ID-only)
  current_tariff        VARCHAR(50),
  monthly_data_usage_gb NUMERIC(8,2),
  monthly_voice_min     NUMERIC(8,2),
  monthly_spend_try     NUMERIC(10,2),
  tenure_months         INT,
  past_accepted_count   INT DEFAULT 0,
  past_rejected_count   INT DEFAULT 0,
  complaint_count       INT DEFAULT 0,
  data_usage_trend_pct  NUMERIC(6,2),      -- son 60 gün değişim %
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE predictions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id           UUID NOT NULL,
  campaign_id             UUID,             -- campaign-db campaigns.id (ID-only)
  case_id                 UUID,             -- campaign-db optimization_cases.id (ID-only)
  recommendation_score    NUMERIC(4,3) NOT NULL,
  conversion_probability  NUMERIC(4,3) NOT NULL,
  predicted_segment       VARCHAR(20) NOT NULL,
  predicted_priority      VARCHAR(10) NOT NULL,
  reasoning               TEXT,
  model_version_id        UUID REFERENCES model_versions(id),
  is_ai_misclassified     BOOLEAN NOT NULL DEFAULT false,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE model_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_tag     VARCHAR(30) NOT NULL,     -- örn: v1.0-rf
  model_type      VARCHAR(50),              -- RandomForest / GradientBoosting
  trained_on      INT,                      -- kaç örnek ile eğitildi
  accuracy        NUMERIC(5,4),
  f1_score        NUMERIC(5,4),
  is_active        BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prediction_corrections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id     UUID NOT NULL REFERENCES predictions(id),
  corrected_by      UUID NOT NULL,         -- users.id (ID-only)
  original_segment  VARCHAR(20),
  corrected_segment VARCHAR(20),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE training_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id UUID REFERENCES model_versions(id),
  dataset_size    INT,
  train_size      INT,
  test_size       INT,
  metrics         JSONB,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at     TIMESTAMPTZ
);
```

## 4. GAMIFICATION-DB

```sql
CREATE TABLE points_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id     UUID NOT NULL,           -- users.id (ID-only)
  case_id       UUID,                    -- optimization_cases.id (ID-only)
  points        INT NOT NULL,            -- +10, +5, +15, -5, -3 vb.
  reason        VARCHAR(50) NOT NULL,    -- OPTIMIZATION_COMPLETED, FAST_BONUS, SLA_EXCEEDED, LOW_RATING...
  event_id      UUID,                    -- kaynak RabbitMQ event_id (idempotency için)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE badges (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(30) UNIQUE NOT NULL,   -- ILK_KAMPANYA, HIZ_USTASI, ...
  name          VARCHAR(100) NOT NULL,
  description   TEXT
);

CREATE TABLE user_badges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id     UUID NOT NULL,
  badge_id      INT NOT NULL REFERENCES badges(id),
  earned_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(expert_id, badge_id)
);

CREATE TABLE levels (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(20) UNIQUE NOT NULL,   -- Bronz, Gümüş, Altın, Platin
  min_points    INT NOT NULL,
  max_points    INT
);

CREATE TABLE leaderboard_snapshots (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period        VARCHAR(10) NOT NULL CHECK (period IN ('DAILY','WEEKLY')),
  snapshot_date DATE NOT NULL,
  expert_id     UUID NOT NULL,
  total_points  INT NOT NULL,
  rank          INT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 5. Cross-Service ID Reference Map

| Alan | Bulunduğu Servis | Referans Verdiği Servis (ID-only, FK yok) |
|---|---|---|
| `campaigns.created_by` | campaign-db | identity-db `users.id` |
| `optimization_cases.assigned_expert_id` | campaign-db | identity-db `users.id` |
| `subscriber_feedback.subscriber_id` | campaign-db | identity-db `users.id` |
| `subscriber_profiles.subscriber_id` | ai-db | identity-db `users.id` |
| `predictions.campaign_id` / `case_id` | ai-db | campaign-db |
| `points_transactions.expert_id` | gamification-db | identity-db `users.id` |
| `points_transactions.case_id` | gamification-db | campaign-db |

Bu referanslar **event payload'ları veya REST çağrıları** üzerinden senkronize edilir; asla
doğrudan SQL join ile değil.
