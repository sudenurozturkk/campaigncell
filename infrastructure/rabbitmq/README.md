# CampaignCell — RabbitMQ Event Architecture & Topology

## 1. Genel Yapı
CampaignCell mikroservis ekosistemi olay-tabanlı (event-driven) asenkron iletişim için **RabbitMQ Topic Exchange** mimarisini kullanır.

- **Primary Exchange**: `campaigncell.events` (type: `topic`, durable: `true`)
- **Dead-Letter Exchange (DLX)**: `campaigncell.events.dlx` (type: `topic`, durable: `true`)

---

## 2. Kuyruk ve Routing Key Haritası

| Kuyruk (Queue) | Binding Routing Key(s) | Tüketici (Consumer) Servis | Açıklama |
|---|---|---|---|
| `q.gamification.campaign-events` | `campaign.optimized`, `campaign.assigned`, `sla.breached`, `subscriber.feedback.submitted` | `gamification-service` | Puan verme, seviye belirleme ve rozet kazanım tetikleyicileri |
| `q.ai.campaign-events` | `campaign.created`, `campaign.optimization.required`, `segment.changed`, `subscriber.offer.#` | `ai-service` | Otomatik ML skorlama, dönüşüm etiketleme ve doğruluk düzeltme |
| `q.campaign.ai-events` | `ai.prediction.created`, `ai.service.recovered` | `campaign-service` | AI skorlarını işleme ve servis kurtarma (degradation recovery) |
| `q.notifications.all` | `#` (tüm olaylar) | `api-gateway` / WebSockets | Canlı arayüz bildirimleri |
| `q.dlq.failed-events` | `#` (DLX üzerinden) | Manuel / Retry Job | İşlenemeyen mesajların tutulduğu Dead Letter Queue |

---

## 3. Idempotency (Yinelemesizlik)
Her mesaj zarfında benzersiz bir `event_id` (UUID v4) taşınır. Tüketici servisler aynı `event_id` ile gelen mesajları iki kez işlemez.
