# Software Requirements Specification (SRS)
## CampaignCell — Yapay Zeka Destekli Kişiselleştirilmiş Kampanya ve Öneri Platformu

**Doküman Versiyonu:** 1.0  
**Tarih:** 22 Temmuz 2026  
**Yarışma:** Turkcell CodeNight 2026 Final  
**Proje Deposu:** [sudenurozturkk/campaigncell](https://github.com/sudenurozturkk/campaigncell)  

---

## 📄 İçindekiler
1. [Giriş (Introduction)](#1-giriş-introduction)
2. [Genel Tanım (Overall Description)](#2-genel-tanım-overall-description)
3. [Sistem Özellikleri ve Fonksiyonel Gereksinimler](#3-sistem-özellikleri-ve-fonksiyonel-gereksinimler)
4. [Dış Arayüz Gereksinimleri](#4-dış-arayüz-gereksinimleri)
5. [Fonksiyonel Olmayan Gereksinimler (NFRs)](#5-fonksiyonel-olmayan-gereksinimler-nfrs)
6. [Doğrulama ve Uyum Matrisi](#6-doğrulama-ve-uyum-matrisi)

---

## 1. Giriş (Introduction)

### 1.1 Amaç
Bu doküman, Turkcell CodeNight 2026 Final Case isterleri doğrultusunda geliştirilen **CampaignCell** platformunun tüm yazılım gereksinimlerini (SRS), mimari sınırlarını, fonksiyonel ve fonksiyonel olmayan gereksinimlerini teknik detaylarıyla tanımlar.

### 1.2 Kapsam
CampaignCell, Turkcell abonelerine doğru zamanda, doğru kanaldan, kişiselleştirilmiş en uygun teklifi (ek paket, tarife yükseltme, cihaz fırsatı, sadakat indirimi) sunan, 4 bağımsız mikroservis ve 1 API Gateway'den oluşan uçtan uca bir mikroservis ekosistemidir.

### 1.3 Tanımlar ve Kısaltmalar
- **SRS**: Software Requirements Specification (Yazılım Gereksinim Özellikleri)
- **DB-per-Service**: Servis Başına Bağımsız Veritabanı Mimarisi
- **DLX / DLQ**: Dead-Letter Exchange / Dead-Letter Queue (İşlenemeyen olay kuyruğu)
- **XAI**: Explainable AI (Açıklanabilir Yapay Zeka gerekçelendirmesi)
- **SLA**: Service Level Agreement (Hizmet Seviyesi Anlaşması)
- **RBAC**: Role-Based Access Control (Rol Bazlı Erişim Kontrolü)

---

## 2. Genel Tanım (Overall Description)

### 2.1 Ürün Perspektifi ve Mimari Topoloji
CampaignCell, mikroservis odaklı ve olay-tabanlı (event-driven) bir mimaride inşa edilmiştir:

```
                          ┌───────────────────────────┐
                          │     Web Frontend App      │
                          │   (Next.js 15 App Router) │
                          └─────────────┬─────────────┘
                                        │ (Port 8080)
                                        ▼
                          ┌───────────────────────────┐
                          │        API GATEWAY        │
                          │   (Node.js / Express)     │
                          └─────────────┬─────────────┘
                                        │
      ┌───────────────────┬─────────────┴─────────────┬───────────────────┐
      ▼                   ▼                           ▼                   ▼
┌─────────────┐     ┌─────────────┐             ┌─────────────┐     ┌─────────────┐
│  Identity   │     │  Campaign   │             │     AI      │     │Gamification │
│   Service   │     │   Service   │             │   Service   │     │   Service   │
│ (NestJS/3001)     │ (NestJS/3002)             │(FastAPI/8000)     │ (NestJS/3003)
└──────┬──────┘     └──────┬──────┘             └──────┬──────┘     └──────┬──────┘
       ▼                   ▼                           ▼                   ▼
  [identity-db]      [campaign-db]                  [ai-db]          [gamification-db]
   (Port 5433)        (Port 5434)                 (Port 5435)         (Port 5436)
```

### 2.2 Kullanıcı Rolleri ve Yetki Matrisi (§3.3)

| İşlem / Endpoint | Abone (`SUBSCRIBER`) | Uzman (`CAMPAIGN_EXPERT`) | Süpervizör (`SUPERVISOR`) | Admin (`ADMIN`) |
|---|---|---|---|---|
| Kampanya Oluşturma | ❌ | ✅ | ✅ | ✅ |
| Kendi Kayıtlarını Görme | ✅ | ✅ (Atanan) | ✅ (Tümü) | ✅ (Tümü) |
| Durum Değiştirme (State Machine) | ❌ | ✅ | ✅ | ✅ |
| Manuel Uzman Atama | ❌ | ❌ | ✅ | ✅ |
| Segment Override (AI Düzeltme) | ❌ | ✅ | ✅ | ✅ |
| Dashboard & Analitik Görme | ❌ | ❌ | ✅ | ✅ |
| Personel Hesabı Oluşturma | ❌ | ❌ | ❌ | ✅ |
| Audit Log Görüntüleme | ❌ | ❌ | ❌ | ✅ |

### 2.3 Teknolojik Altyapı ve Bağımlılıklar
- **Backend Frameworks**: NestJS (v10+), Python FastAPI (v0.110+)
- **ORM / Veritabanları**: Prisma ORM 6.4 (Identity, Campaign, Gamification), SQLAlchemy (AI Service), PostgreSQL 16 (4 bağımsız DB)
- **Mesaj Kuyruğu (Event Bus)**: RabbitMQ 3.12 (Topic Exchange + DLQ)
- **Frontend**: Next.js 15, React 18, TypeScript 5, Tailwind CSS 3
- **Containerization**: Docker & Docker Compose (Tek komutla `docker compose up` çalıştırma)

---

## 3. Sistem Özellikleri ve Fonksiyonel Gereksinimler

### 3.1 Identity Service (§3)
- **FR-ID-01 (GSM + OTP Girişi)**: Abone girişi GSM numarası ve simüle edilmiş `1234` OTP kodu ile gerçekleştirilir.
- **FR-ID-02 (Personel Hesap Yönetimi)**: Admin kullanıcıları e-posta + şifre ile giriş yapan personel hesapları oluşturur. Oluştururken uzmanlık alanları (`expertise_tags`) ve bölge (`region`) bilgisi atanır.
- **FR-ID-03 (Şifre Güvenlik Politikası)**: Şifreler en az 8 karakter, 1 büyük harf, 1 rakam ve 1 özel karakter içermelidir. İhlal durumunda spesifik kural hatası fırlatılır. Şifreler `bcrypt` ile hash'lenir.
- **FR-ID-04 (Hesap Kilitleme)**: 5 ardışık başarısız girişte hesap 15 dakika boyunca kilitlenir (`locked_until`). Kilitli hesaba girişte kalan dakika bilgisi dönülür.
- **FR-ID-05 (Token Rotation & Theft Protection)**: Access token 15 dakika, Refresh token 7 gün geçerlidir. Refresh token kullanıldığında eski token geçersiz kılınır ve yenisi verilir. Geçersiz kılınmış bir refresh token tekrar kullanılmaya çalışılırsa kullanıcının tüm aktif oturumları sonlandırılır.
- **FR-ID-06 (Audit Log)**: Başarılı/başarısız girişler, hesap kilitlenmeleri, rol değişiklikleri, 403 ihlalleri ve kritik durum değişiklikleri `user_id`, `action`, `timestamp`, `ip_address`, `result` ve `resource_id` alanlarıyla kaydedilir.

### 3.2 Campaign Service (§4)
- **FR-CMP-01 (Kampanya Oluşturma)**: Başlık, tür (`EK_PAKET`, `TARIFE_YUKSELTME`, `CIHAZ_FIRSATI`, `SADAKAT`), hedef segment, indirim oranı ve geçerlilik süresi ile kampanya oluşturulur. Otomatik `CMP-2026-XXXXXX` benzersiz kodu üretilir.
- **FR-CMP-02 (Graceful Degradation)**: AI Servis erişilemez durumdaysa kampanya `status = MANUAL_OPTIMIZATION_REQUIRED` ve segment `BELIRSIZ` olarak kaydedilir.
- **FR-CMP-03 (State Machine & HTTP 422)**: Kampanya vakası durum geçişleri: `YENI` → `ATANDI` → `OPTIMIZE_EDILIYOR` → `TEST_EDILIYOR` → `TAMAMLANDI` → `YAYINDA` → `ARSIVLENDI`. Kural dışı geçişlerde **HTTP 422 Unprocessable Entity** fırlatılır. `TAMAMLANDI` geçişinde `optimizationNote` girilmesi zorunludur.
- **FR-CMP-04 (SLA Kuralları - §4.4)**:
  - `KRITIK`: **2 Saat** (Aşımda vaka kırmızı işaretlenir ve üstte sabitlenir)
  - `YUKSEK`: **8 Saat** (Turuncu işaretlenir)
  - `ORTA`: **24 Saat** (Görsel uyarı)
  - `DUSUK`: **72 Saat** (Görsel uyarı)

### 3.3 AI Service (§5)
- **FR-AI-01 (Öneri Skorlama)**: Abone veri kullanımı, harcama ve geçmiş etkileşimlerine göre 0.0-1.0 arasında öneri skoru ve dönüşüm olasılığı hesaplar.
- **FR-AI-02 (Segment Sınıflandırma)**: Aboneleri `YUKSEK_DEGER`, `RISKLI_KAYIP`, `YENI_ABONE`, `PASIF` olarak sınıflandırır. `RISKLI_KAYIP` riski olan vakalar otomatik `KRITIK` öncelik alır.
- **FR-AI-03 (Akıllı Uzman Ataması)**:
  $$\text{skor} = (\text{uzmanlık\_eşleşme} \times 0.5) + (\text{boşluk\_oranı} \times 0.3) + (\text{performans} \times 0.2)$$
  formülü ile en uygun uzmana vakayı otomatik atar.
- **FR-AI-04 (Doğruluk Takibi ve Kategori Kırılımı - §5.4 & §12.1)**: Segment override (AI düzeltme) yapıldığında `is_ai_misclassified = true` olarak kaydedilir. `GET /api/v1/ai/accuracy` endpoint'inde genel doğruluk oranı ile `YUKSEK_DEGER`, `RISKLI_KAYIP`, `YENI_ABONE`, `PASIF` kategori kırılım oranları sunulur.

### 3.4 Gamification Service (§6)
- **FR-GAM-01 (Olay Tabanlı Puanlama - §6.1)**:
  - Optimizasyon tamamlandı: **+10 Puan**
  - Hızlı optimizasyon bonusu (< 2 saat): **+5 Puan**
  - Dönüşüm hedefi aşıldı: **+15 Puan**
  - KRİTİK vaka SLA içi tamamlandı: **+15 Puan**
  - SLA aşımı: **-5 Puan**
  - Abone düşük puan verdi (1-2 yıldız): **-3 Puan**
- **FR-GAM-02 (Rozet Kataloğu - §6.2)**: `ILK_KAMPANYA`, `HIZ_USTASI`, `DONUSUM_KRALI`, `MARATONCU`, `CHURN_AVCISI`, `UZMAN`. Rozet kazanıldığında `badge.earned` event'i fırlatılır.
- **FR-GAM-03 (Seviyeler - §6.3)**: `Bronz` (0-499), `Gümüş` (500-1,499), `Altın` (1,500-2,999), `Platin` (3,000+).
- **FR-GAM-04 (Idempotency)**: Mesaj zarfındaki `event_id` veritabanında kontrol edilerek mükerrer puan verilmesi kesin olarak engellenir.

### 3.5 API Gateway (§8)
- **FR-GW-01 (Routing)**: Port `8080` üzerinden tüm isteklere dinamik proxy yönlendirmesi.
- **FR-GW-02 (Correlation-ID)**: Her isteğe `x-correlation-id` (UUID v4) üretir ve downstream servislere aktarır.
- **FR-GW-03 (Rate Limiting)**: IP başına dakikada maksimum 100 istek sınırı.
- **FR-GW-04 (Aggregated Health Check)**: `GET /health` ile 4 mikroservisin canlılığını tek çıktıda raporlar.

---

## 4. Dış Arayüz Gereksinimleri

### 4.1 Kullanıcı Arayüzü (Next.js 15 App Router)
- **Abone Portalı (`/dashboard/subscriber`)**: Kişiselleştirilmiş fırsatlar, XAI açıklama kutusu, kabul/ret ve 1-5 yıldız değerlendirme modalı.
- **Uzman Paneli (`/dashboard/expert`)**: Kampanya oluşturma sihirbazı, Vaka yönetim tablosu, State Machine durum değiştirici, Segment Override modalı.
- **Süpervizör Paneli (`/dashboard/supervisor`)**: AI Accuracy, Kategori Kırılım Kartları, SLA Takip tablosu ve Canlı Oyunlaştırma Liderlik Tablosu.

---

## 5. Fonksiyonel Olmayan Gereksinimler (NFRs)

### 5.1 Güvenlik (Security & Audit)
- Tüm şifreler `bcrypt` ile tuzlanarak saklanır.
- IDOR, SQL Injection ve XSS saldırılarına karşı `ValidationPipe` ve parameterized query koruması mevcuttur.
- Yetkisiz 403 erişimleri audit log tablosuna otomatik işlenir.

### 5.2 Dayanıklılık ve Hizmet Kesintisizliği (Resilience & Degradation)
- AI Servisi durdurulduğunda (`docker stop campaigncell-ai-service`) Campaign Service çökmeksizin kampanyaları manuel optimizasyon kuyruğuna alır.
- AI Servis yeniden açıldığında (`ai.service.recovered`) beklemedeki kampanyalar otomatik analize tabi tutulur.

---

## 6. Doğrulama ve Uyum Matrisi

| Case Maddesi | Şart | Sistem Durumu | Doğrulama Yöntemi |
|---|---|---|---|
| §2.1 | 4 Mikroservis + 1 API Gateway | ✅ Tam Uyum | Docker Compose & Gateway Proxy |
| §2.2 | Database-per-service | ✅ Tam Uyum | 4 Bağımsız DB Konteyneri (Ports 5433-5436) |
| §3.2 | Token Rotation & Theft Protection | ✅ Tam Uyum | `refresh_tokens.is_revoked` DB Revocation |
| §4.2 | State Machine HTTP 422 | ✅ Tam Uyum | `UnprocessableEntityException` Testleri |
| §4.4 | SLA Süreleri (2h/8h/24h/72h) | ✅ Tam Uyum | `CampaignsService` Deadline Logic |
| §5.4 | AI Kategori Doğruluk Kırılımı | ✅ Tam Uyum | `/api/v1/ai/accuracy` Response & UI |
| §6.3 | Seviye Eşikleri (0-499, 500-1499, 1500-2999, 3000+) | ✅ Tam Uyum | `PointsService` & Prisma Seed |
| §12.1 | CI/CD Pipeline (+2 Bonus Puan) | ✅ Tam Uyum | `.github/workflows/ci.yml` Pipeline |

---
*CampaignCell SRS Dokümanı — Turkcell CodeNight 2026 Final Şampiyonluk Spesifikasyonu.*
