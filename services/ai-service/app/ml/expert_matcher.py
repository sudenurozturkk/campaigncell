from typing import Dict, Any, List

# Simüle Edilmiş Kampanya Uzmanları Listesi (Identity Service ile senkronize veriler)
MOCK_EXPERTS = [
    {
        "id": "a7f30000-0000-0000-0000-000000000001",
        "name": "Ahmet Yılmaz (Kampanya Uzmanı)",
        "expertise_tags": ["CHURN_PREVENTION", "RISKLI_KAYIP", "DEVICE_UPSELL"],
        "active_workload": 3,
        "performance_rating": 0.92,
    },
    {
        "id": "a7f30000-0000-0000-0000-000000000002",
        "name": "Ayşe Kaya (Segment Uzmanı)",
        "expertise_tags": ["YUKSEK_DEGER", "TARIFE_YUKSELTME", "SADAKAT"],
        "active_workload": 1,
        "performance_rating": 0.88,
    },
    {
        "id": "a7f30000-0000-0000-0000-000000000003",
        "name": "Mehmet Demir (Genel Kampanya Uzmanı)",
        "expertise_tags": ["YENI_ABONE", "EK_PAKET", "PASIF"],
        "active_workload": 5,
        "performance_rating": 0.82,
    },
]

def find_best_expert_for_case(target_segment: str, campaign_type: str = "EK_PAKET") -> Dict[str, Any]:
    """
    Optimizasyon vakası için en uygun uzmanı ve atama skorunu hesaplar.
    Formül: assignment_score = (expertise_match * 0.5) + (availability * 0.3) + (performance * 0.2)
    """
    best_expert = None
    max_score = -1.0

    for expert in MOCK_EXPERTS:
        # 1. Uzmanlık Eşleşmesi (0.0 - 1.0)
        tags = expert["expertise_tags"]
        expertise_match = 0.5
        if target_segment in tags:
            expertise_match += 0.35
        if campaign_type in tags:
            expertise_match += 0.15
        expertise_match = min(expertise_match, 1.0)

        # 2. Müsaitlik (Availability) (0.0 - 1.0) -> Az iş yükü = Yüksek puan
        workload = expert["active_workload"]
        availability = max(1.0 - (workload * 0.15), 0.1)

        # 3. Geçmiş Performans (0.0 - 1.0)
        performance = expert["performance_rating"]

        # Toplam Atama Skoru
        score = (expertise_match * 0.5) + (availability * 0.3) + (performance * 0.2)
        score = round(min(score, 0.99), 3)

        if score > max_score:
            max_score = score
            best_expert = {
                "expert_id": expert["id"],
                "expert_name": expert["name"],
                "assignment_score": score,
                "reasoning": f"Uzmanlık uyumu (%{int(expertise_match*100)}), düşük iş yükü ({workload} aktif vaka) ve yüksek performans skoru ({int(performance*100)}) nedeniyle önerilmiştir.",
            }

    return best_expert
