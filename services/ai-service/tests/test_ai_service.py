import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.ml.dataset_generator import generate_synthetic_telecom_dataset
from app.ml.predictor import PredictorEngine
from app.ml.expert_matcher import find_best_expert_for_case
from main import app

# Test için in-memory SQLite veritabanı
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_ai.db"
test_engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

client = TestClient(app)

def test_synthetic_dataset_generator():
    df = generate_synthetic_telecom_dataset(num_samples=100)
    assert len(df) == 100
    assert 'monthly_data_usage_gb' in df.columns
    assert 'target_segment' in df.columns
    assert 'is_converted' in df.columns

def test_predictor_engine():
    engine = PredictorEngine()
    features = {
        'monthly_data_usage_gb': 35.0,
        'monthly_voice_min': 800.0,
        'monthly_spend_try': 450.0,
        'tenure_months': 24,
        'past_accepted_count': 3,
        'past_rejected_count': 0,
        'complaint_count': 0,
        'data_usage_trend_pct': 15.0,
    }
    result = engine.predict(features)
    assert 'recommendation_score' in result
    assert 0.0 <= result['recommendation_score'] <= 1.0
    assert 'conversion_probability' in result
    assert result['predicted_segment'] in ["YUKSEK_DEGER", "RISKLI_KAYIP", "YENI_ABONE", "PASIF", "BELIRSIZ"]
    assert "AI Analizi:" in result['reasoning']

def test_expert_matcher():
    expert = find_best_expert_for_case(target_segment="RISKLI_KAYIP", campaign_type="CIHAZ_FIRSATI")
    assert expert is not None
    assert 'expert_id' in expert
    assert expert['assignment_score'] > 0.5

def test_health_endpoint():
    response = client.get("/api/v1/ai/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data['service'] == 'ai-service'

def test_recommend_endpoint():
    payload = {
        "subscriber_id": "test-sub-12345",
        "campaign_id": "test-camp-001",
        "campaign_type": "EK_PAKET",
        "profile_override": {
            "monthly_data_usage_gb": 40.0,
            "monthly_spend_try": 500.0,
            "tenure_months": 36,
            "past_accepted_count": 4,
            "past_rejected_count": 0,
            "complaint_count": 0,
            "data_usage_trend_pct": 20.0
        }
    }
    response = client.post("/api/v1/ai/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['subscriber_id'] == "test-sub-12345"
    assert data['recommendation_score'] > 0
    assert data['recommended_expert'] is not None

def test_train_endpoint():
    payload = {"num_samples": 200, "model_type": "RandomForest"}
    response = client.post("/api/v1/ai/train", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data['trained_on'] == 200
    assert data['accuracy'] > 0

def test_accuracy_endpoint():
    response = client.get("/api/v1/ai/accuracy")
    assert response.status_code == 200
    data = response.json()
    assert 'accuracy_percentage' in data

def test_subscriber_profile_endpoints():
    get_res = client.get("/api/v1/ai/subscribers/sub-999")
    assert get_res.status_code == 200
    data = get_res.json()
    assert data['subscriber_id'] == 'sub-999'

    update_payload = {
        "current_tariff": "Yeni Paket 25GB",
        "monthly_data_usage_gb": 25.0,
        "monthly_voice_min": 700.0,
        "monthly_spend_try": 350.0,
        "tenure_months": 15,
        "past_accepted_count": 2,
        "past_rejected_count": 0,
        "complaint_count": 1,
        "data_usage_trend_pct": 5.0
    }
    put_res = client.put("/api/v1/ai/subscribers/sub-999", json=update_payload)
    assert put_res.status_code == 200
    updated_data = put_res.json()
    assert updated_data['current_tariff'] == "Yeni Paket 25GB"
