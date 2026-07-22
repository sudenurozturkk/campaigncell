# CampaignCell — AI Service

AI Service, Turkcell abonelerinin kullanım alışkanlıklarını analiz ederek kişiselleştirilmiş kampanya önerisi skorlayan, dönüşüm olasılığı tahmini üreten, segment sınıflandırması yapan ve akıllı uzman ataması gerçekleştiren Python / FastAPI tabanlı makine öğrenmesi mikroservisidir.

## 🚀 Sorumluluklar & Görevler

1. **Öneri Skorlama & Dönüşüm Tahmini**:
   - `scikit-learn` tabanlı `RandomForestClassifier` ve `GradientBoostingClassifier` modelleri.
   - Abone veri kullanımı (GB), konuşma dakikası, aylık harcama (ARPU), abonelik süresi (tenure), şikayet geçmişi ve kullanım trendini girdi olarak alır.
   - Çıktı: Öneri skoru (0.0-1.0) ve dönüşüm olasılığı (0.0-1.0).
2. **Segment Sınıflandırma**:
   - Abone davranışını `YUKSEK_DEGER`, `RISKLI_KAYIP`, `YENI_ABONE`, `PASIF` segmentlerine ayırır.
   - `RISKLI_KAYIP` (churn riski) segmenti otomatik `KRITIK` / `YUKSEK` öncelik alır.
3. **Akıllı Uzman Ataması**:
   - Algoritma: `skor = (uzmanlik_eslesme × 0.5) + (müsaitlik × 0.3) + (performans × 0.2)`
   - Vaka segmentine en uygun uzmanın atanmasını önerir.
4. **XAI (Açıklanabilir Yapay Zeka)**:
   - Tahmin kararlarının arkasındaki nedenleri anlaşılır Türkçe metin olarak üretir ("Aylık 38.5 GB yüksek veri kullanımı ve 2 aktif şikayet nedeniyle RISKLI_KAYIP olarak değerlendirilmiştir").
5. **Doğruluk Takibi & Canlı Model Eğitimi**:
   - Yanlış sınıflandırmaları (`PredictionCorrection`) takip eder. Kategori bazlı doğruluk kırılımı sunar.
   - `POST /api/v1/ai/train` endpoint'i ile istenilen örneklem sayısı ve model türüyle canlı yeniden eğitim yapılabilir.

## 📡 API Endpointleri

| Metot | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/v1/ai/health` | Servis ve veritabanı durum kontrolü |
| `POST` | `/api/v1/ai/recommend` | Kampanya öneri skoru, dönüşüm olasılığı ve XAI gerekçesi üretir |
| `POST` | `/api/v1/ai/train` | Modeli yeni sentetik/gerçek veriyle yeniden eğitir ve versiyonlar |
| `GET` | `/api/v1/ai/accuracy` | Canlı model doğruluk oranını ve kategori kırılımını getirir |
| `GET` | `/api/v1/ai/subscribers/:id` | Abonenin AI profil detaylarını getirir |
| `PUT` | `/api/v1/ai/subscribers/:id` | Abonenin AI profilini günceller |

## ⚙️ Environment Değişkenleri

```env
PORT=8000
DATABASE_URL=postgresql://campaigncell_user:campaigncell_secret_2026@ai-db:5432/ai_db
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```
