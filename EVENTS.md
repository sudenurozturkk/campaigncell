# CampaignCell — Event Catalog (RabbitMQ)

Exchange: `campaigncell.events` (type: `topic`)
Routing key convention: `<domain>.<action>` (örn. `campaign.optimized`)
Her queue **durable**, her mesaj **persistent** olmalıdır (servis kapansa da mesaj kaybolmamalı).

## Ortak Event Zarfı (Envelope)

```json
{
  "event_type": "campaign.optimized",
  "event_id": "uuid-v4",
  "timestamp": "2026-07-18T14:22:10Z",
  "source": "campaign-service",
  "version": "1.0",
  "payload": { }
}
```

`event_id` idempotency-key olarak tüketici tarafında kullanılır (aynı event iki kez işlenmez).

---

## Campaign Domain (Publisher: campaign-service)

| Event | Ne Zaman | Consumer(s) |
|---|---|---|
| `campaign.created` | Kampanya oluşturulduğunda | ai-service (analiz tetikler) |
| `campaign.optimization.required` | Düşük dönüşüm tespit edildiğinde optimizasyon vakası açılır | ai-service (uzman ataması için) |
| `campaign.assigned` | Vaka bir uzmana atandığında (AI veya manuel) | gamification-service (yük takibi), identity-service (bildirim) |
| `campaign.optimized` | Vaka TAMAMLANDI durumuna geçtiğinde | gamification-service (puan/rozet) |
| `campaign.published` | Vaka YAYINDA durumuna geçtiğinde | — (analytics) |
| `campaign.archived` | Geçerlilik süresi dolduğunda | — (analytics) |
| `segment.changed` | Uzman/süpervizör AI segmentini değiştirdiğinde | ai-service (doğruluk metriği — `is_ai_misclassified=true`) |

### Örnek: `campaign.optimized`
```json
{
  "event_type": "campaign.optimized",
  "event_id": "5e2f...",
  "timestamp": "2026-07-18T14:22:10Z",
  "source": "campaign-service",
  "version": "1.0",
  "payload": {
    "case_id": "CMP-2026-000123",
    "expert_id": "a7f3-...",
    "segment": "RISKLI_KAYIP",
    "priority": "YUKSEK",
    "conversion_lift": 0.18,
    "created_at": "2026-07-18T13:40:02Z",
    "completed_at": "2026-07-18T14:22:10Z",
    "sla_met": true
  }
}
```

## Subscriber Domain (Publisher: campaign-service)

| Event | Ne Zaman | Consumer(s) |
|---|---|---|
| `subscriber.offer.accepted` | Abone teklifi kabul ettiğinde | ai-service (conversion label güncelleme) |
| `subscriber.offer.rejected` | Abone reddettiğinde | ai-service (benzer kampanya skorunu düşürme) |
| `subscriber.feedback.submitted` | 1-5 yıldız verildiğinde | gamification-service (düşük puan cezası, örn. -3) |

## SLA Domain (Publisher: campaign-service, zamanlayıcı job ile)

| Event | Ne Zaman | Consumer(s) |
|---|---|---|
| `sla.warning` | SLA süresinin %80'i dolduğunda | frontend (bildirim), supervisor dashboard |
| `sla.breached` | SLA süresi aşıldığında | gamification-service (-5 puan), supervisor dashboard |

## Gamification Domain (Publisher: gamification-service)

| Event | Ne Zaman | Consumer(s) |
|---|---|---|
| `badge.earned` | Rozet koşulu sağlandığında | frontend (toast/modal bildirim) |
| `points.awarded` | Her puan işleminde | frontend (leaderboard canlı güncelleme) |

## AI Domain (Publisher: ai-service)

| Event | Ne Zaman | Consumer(s) |
|---|---|---|
| `ai.prediction.created` | Yeni skor/segment/probability üretildiğinde | campaign-service (kampanyaya işlenir) |
| `ai.prediction.corrected` | Uzman override sonrası doğruluk kaydı güncellendiğinde | — (analytics/accuracy hesaplama) |
| `ai.service.recovered` | AI Service healthcheck yeniden yeşile döndüğünde (self-published on startup) | campaign-service (BELIRSIZ kuyruğunu yeniden işler) |

---

## Queue Tasarımı (öneri)

| Queue | Bind Routing Key(s) | Consumer |
|---|---|---|
| `q.gamification.campaign-events` | `campaign.optimized`, `campaign.assigned`, `sla.breached`, `subscriber.feedback.submitted` | gamification-service |
| `q.ai.campaign-events` | `campaign.created`, `campaign.optimization.required`, `segment.changed`, `subscriber.offer.*` | ai-service |
| `q.campaign.ai-events` | `ai.prediction.created`, `ai.service.recovered` | campaign-service |
| `q.notifications.all` | `#` (tüm event'ler) | frontend notification gateway (WebSocket/SSE — bonus) |

Dead-letter exchange: `campaigncell.events.dlx` — 3 başarısız işleme denemesinden sonra mesaj
DLQ'ya düşer ve manuel/otomatik retry job'u ile tekrar denenir.
