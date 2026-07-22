import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, SessionLocal
from app.api.endpoints import router as ai_router
from app.events.rabbitmq import RabbitMQManager
from app.models import Prediction, PredictionCorrection, SubscriberProfile

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("AIServiceMain")

def handle_rabbitmq_event(routing_key: str, data: dict):
    """
    RabbitMQ'dan gelen event'leri işleme mantığı.
    """
    logger.info(f"AI Service event alındı: {routing_key}")
    payload = data.get("payload", {})
    db = SessionLocal()

    try:
        if routing_key == "segment.changed":
            case_id = payload.get("case_id")
            original_segment = payload.get("original_segment")
            corrected_segment = payload.get("corrected_segment")
            corrected_by = payload.get("corrected_by", "SYSTEM")

            # İlgili vakanın en son prediction kaydını güncelle
            if case_id:
                pred = db.query(Prediction).filter(Prediction.case_id == case_id).order_by(Prediction.created_at.desc()).first()
                if pred:
                    pred.is_ai_misclassified = True
                    correction = PredictionCorrection(
                        prediction_id=pred.id,
                        corrected_by=corrected_by,
                        original_segment=original_segment,
                        corrected_segment=corrected_segment
                    )
                    db.add(correction)
                    db.commit()
                    logger.info(f"Prediction {pred.id} misclassified olarak işaretlendi ve düzeltme kaydı oluşturuldu.")

        elif routing_key == "subscriber.offer.accepted":
            sub_id = payload.get("subscriber_id")
            if sub_id:
                prof = db.query(SubscriberProfile).filter(SubscriberProfile.subscriber_id == sub_id).first()
                if prof:
                    prof.past_accepted_count = (prof.past_accepted_count or 0) + 1
                    db.commit()

        elif routing_key == "subscriber.offer.rejected":
            sub_id = payload.get("subscriber_id")
            if sub_id:
                prof = db.query(SubscriberProfile).filter(SubscriberProfile.subscriber_id == sub_id).first()
                if prof:
                    prof.past_rejected_count = (prof.past_rejected_count or 0) + 1
                    db.commit()

    except Exception as e:
        logger.error(f"Event {routing_key} işlenirken veritabanı hatası: {e}")
        db.rollback()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AI Service başlatılıyor...")
    
    # 1. Veritabanı tablolarını oluştur
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("AI Service veritabanı tabloları hazır.")
    except Exception as e:
        logger.warning(f"Veritabanı tabloları oluşturulurken uyarı (Postgres kapalı olabilir): {e}")

    # 2. RabbitMQ Bağlantısını kur ve dinleyiciyi başlat
    rabbitmq = RabbitMQManager()
    rabbitmq.start_consumer(handle_rabbitmq_event)

    # 3. Startup Event fırlat (ai.service.recovered)
    rabbitmq.publish_recovered_event()

    yield

    logger.info("AI Service sonlandırılıyor...")

app = FastAPI(
    title="CampaignCell - AI Service",
    description="AI Recommendation Scoring, Segment Classification, Conversion Prediction & Expert Matching Microservice",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)

@app.get("/")
def root():
    return {
        "service": "AI Service",
        "version": "1.0.0",
        "status": "RUNNING",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
