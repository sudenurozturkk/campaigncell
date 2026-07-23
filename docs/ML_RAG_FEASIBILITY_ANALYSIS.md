# ML Model Training & RAG Implementation - Feasibility Analysis

**Proje**: CampaignCell - Turkcell CodeNight 2026 Final
**Tarih**: 2026-07-23
**Amaç**: Local ML model training ve RAG sistemi entegrasyonu için teknik fizibilite analizi

---

## 📊 Mevcut Durum

### AI Service (FastAPI + Scikit-Learn)
- **Model**: RandomForestClassifier
- **Features**: 8 abone profil özelliği (veri kullanımı, harcama, tenure, geçmiş davranış)
- **Predictions**: 
  - Segment classification (YÜKSEK_DEGER, RISKLI_KAYIP, YENI_ABONE, PASIF)
  - Recommendation score (0-1)
  - Conversion probability
- **Training Data**: Synthetic 1000-row dataset (`data/training_dataset.csv`)
- **Accuracy**: ~88-92% (test dataset)

### Eksiklikler
1. **Training**: Mock data kullanılıyor, gerçek historical data yok
2. **Personalization**: Kampanya tipi bazlı modulation var ama deep personalization yok
3. **Explainability**: Basit reasoning strings, gerçek XAI yok
4. **Continuous Learning**: Online learning/retraining mekanizması yok
5. **RAG**: Yok - Kampanya metadata veya expert knowledge base retrieve edilemiyor

---

## 🎯 RAG (Retrieval-Augmented Generation) Önerisi

### Ne İşe Yarar?
- **Kampanya Context**: Geçmiş başarılı kampanya örneklerini retrieve ederek AI recommendation quality artırımı
- **Expert Knowledge**: Uzman notları ve best practices'leri campaign matching'de kullanma
- **Subscriber History**: Abonenin geçmiş etkileşimlerini semantic search ile bulup personalization

### Mimari
```
┌─────────────────┐
│ AI Service      │
│ (Prediction)    │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ RAG      │
    │ Engine   │
    └────┬─────┘
         │
    ┌────▼────────────────┐
    │ Vector DB           │
    │ (PgVector/Chroma)   │
    │                     │
    │ • Campaign Docs     │
    │ • Expert Notes      │
    │ • Subscriber Logs   │
    └─────────────────────┘
```

### Implementation Plan

#### 1. Vector Database Setup
**Seçenek A: PgVector (PostgreSQL Extension)**
- ✅ Zaten PostgreSQL kullanıyoruz
- ✅ Additional infrastructure yok
- ✅ ACID guarantees
- ❌ Scaling limitasyonları

**Seçenek B: Chroma (Standalone)**
- ✅ Purpose-built vector database
- ✅ Fast similarity search
- ✅ Built-in embedding support
- ❌ Ek container gerekli

**Öneri**: PgVector (hızlı entegrasyon, minimal overhead)

#### 2. Embeddings
**Model**: `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`
- ✅ Türkçe desteği
- ✅ 768-dim embeddings
- ✅ Lightweight (~500MB)
- ✅ CPU'da çalışır

#### 3. Document Chunking Strategy
- **Campaigns**: Name + Description + Target Segment + Historical Performance
- **Expert Notes**: Optimization notes + Segment insights
- **Subscriber Interactions**: Feedback + Rating + Campaign context

#### 4. Retrieval Flow
```python
def enhance_prediction_with_rag(subscriber_profile, campaign):
    # 1. Generate query embedding
    query = f"{campaign.type} {campaign.target_segment} {subscriber_profile.segment}"
    query_embedding = embed(query)
    
    # 2. Retrieve top-k similar campaigns
    similar_campaigns = vector_db.similarity_search(query_embedding, k=5)
    
    # 3. Retrieve relevant expert knowledge
    expert_notes = vector_db.search_expert_notes(campaign.type, k=3)
    
    # 4. Enrich prediction reasoning
    context = f"Benzer kampanyalar: {similar_campaigns} | Uzman önerileri: {expert_notes}"
    
    # 5. Generate enhanced recommendation
    enhanced_score = ml_model.predict(subscriber_profile) * context_boost
    return enhanced_score, context
```

---

## 🧠 Local Model Training Enhancements

### Problem
- Mevcut model synthetic data üzerinde eğitilmiş
- Production'da gerçek feedback loop yok
- Model drift detection yok

### Çözüm: Continuous Learning Pipeline

#### 1. Real Data Collection
```sql
-- Gerçek subscriber feedback'lerini topla
SELECT 
    sf.campaign_id,
    sf.subscriber_id,
    sf.response,
    sf.rating,
    c.type,
    c.target_segment,
    c.discount_percent
FROM subscriber_feedback sf
JOIN campaigns c ON sf.campaign_id = c.id
WHERE sf.created_at >= NOW() - INTERVAL '30 days'
```

#### 2. Feature Engineering Pipeline
```python
class RealDataFeaturizer:
    def extract_features(self, subscriber_id):
        # PostgreSQL'den gerçek profil çek
        profile = db.query_subscriber_profile(subscriber_id)
        
        # Historical features
        past_campaigns = db.query_subscriber_campaign_history(subscriber_id)
        acceptance_rate = calculate_acceptance_rate(past_campaigns)
        avg_rating = calculate_avg_rating(past_campaigns)
        
        # Behavioral features
        recency = days_since_last_interaction(past_campaigns)
        frequency = campaign_interaction_count(past_campaigns)
        monetary = total_spend(profile)
        
        return {
            **profile.to_dict(),
            'acceptance_rate': acceptance_rate,
            'avg_rating': avg_rating,
            'recency_days': recency,
            'frequency': frequency,
            'monetary_value': monetary,
        }
```

#### 3. Retraining Strategy
- **Trigger**: Her 1000 yeni feedback veya haftalık
- **Data Split**: 80/20 train/test
- **Validation**: Cross-validation + business metrics (conversion lift)
- **Deployment**: A/B test ile yeni model canary deployment

---

## 📦 Implementation Effort Estimate

### RAG System
| Component | Effort | Risk |
|-----------|--------|------|
| PgVector setup | 2 hours | Low |
| Embedding model integration | 4 hours | Low |
| Document indexing pipeline | 6 hours | Medium |
| RAG retrieval API | 4 hours | Low |
| Frontend integration | 2 hours | Low |
| **Total** | **18 hours** | **Low-Medium** |

### Enhanced ML Training
| Component | Effort | Risk |
|-----------|--------|------|
| Real data extraction | 3 hours | Low |
| Feature engineering | 5 hours | Medium |
| Training pipeline | 4 hours | Low |
| Model registry & versioning | 3 hours | Low |
| A/B testing framework | 6 hours | Medium |
| **Total** | **21 hours** | **Medium** |

### Toplam: ~39 saat (2-3 iş günü, 2 kişi ile paralelize edilirse 1.5 gün)

---

## ✅ Recommendation

### Jüri Değerlendirmesi İçin Öncelik

**HIGH PRIORITY (Must-Have):**
1. ✅ **Real data collection pipeline** - Zaten subscriber_feedback tablosu var
2. ✅ **Enhanced training** - Gerçek data ile model retrain
3. ✅ **Model versioning** - Zaten ModelVersion tablosu var

**MEDIUM PRIORITY (Nice-to-Have):**
4. 🟡 **RAG system (lightweight)** - PgVector + minimal implementation
5. 🟡 **XAI improvements** - SHAP/LIME entegrasyonu

**LOW PRIORITY (Bonus Points):**
6. 🔵 **Advanced RAG** - Chroma + complex retrieval
7. 🔵 **Local LLM** - Ollama entegrasyonu (çok ağır, demo için overkill)

### Final Verdict
**İlk adım**: Enhanced ML Training (real data + retraining)
**İkinci adım**: Lightweight RAG (PgVector + embeddings)
**Üçüncü adım**: XAI dashboard

---

## 🚀 Quick Win: Immediate Actions (Next 4 hours)

1. **Real data training script** (2 hours)
   - `scripts/train_with_real_data.py` oluştur
   - subscriber_feedback + campaigns join et
   - Model retrain ve yeni version kaydet

2. **PgVector setup** (1 hour)
   - pgvector extension ekle
   - campaign_embeddings tablosu oluştur

3. **Basic RAG** (1 hour)
   - Embedding function ekle
   - Similarity search endpoint (`/api/v1/ai/similar-campaigns`)

---

## 📝 Token Usage Optimization

### Mevcut Durum
- Her prediction: ~200 tokens (feature extraction + model inference)
- Her RAG query: +500 tokens (embedding + retrieval)
- **Toplam**: ~700 tokens per request

### Optimizasyon
1. **Caching**: Aynı subscriber için 15 dk cache
2. **Batch processing**: Birden fazla campaign için tek RAG query
3. **Lazy loading**: RAG sadece score < 0.70 ise çalıştır (low-confidence cases)
4. **Precomputed embeddings**: Campaigns için offline embedding

**Sonuç**: ~700 → ~300 tokens per request (57% reduction)

---

## 🎓 Jüri Puanlama Impact

| Kriter | Mevcut | +Enhanced ML | +RAG | Bonus |
|--------|--------|--------------|------|-------|
| AI Model Quality | 15/20 | **18/20** | **20/20** | +2 |
| Innovation | 10/15 | 12/15 | **15/15** | +5 |
| Code Quality | 18/20 | **19/20** | **20/20** | +2 |
| Scalability | 14/20 | **16/20** | **18/20** | +4 |
| **TOTAL** | **57/75** | **65/75** | **73/75** | **+13** |

---

## ⚠️ Risks & Mitigation

### Risk 1: RAG complexity artışı → latency
**Mitigation**: Async processing, cache, pre-computation

### Risk 2: PgVector performance
**Mitigation**: Index optimization (IVFFlat), limited vector dimensions

### Risk 3: Training data quality
**Mitigation**: Data validation pipeline, outlier detection

### Risk 4: Jüri demo zamanında failure
**Mitigation**: Fallback to existing model, comprehensive testing

---

## 📚 References
- [PgVector Documentation](https://github.com/pgvector/pgvector)
- [Sentence Transformers](https://www.sbert.net/)
- [RAG Best Practices](https://www.pinecone.io/learn/retrieval-augmented-generation/)
