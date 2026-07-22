import os
import json
import uuid
import logging
import threading
import pika
from datetime import datetime, timezone

logger = logging.getLogger("AIServiceRabbitMQ")

class RabbitMQManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RabbitMQManager, cls).__new__(cls)
            cls._instance.connection = None
            cls._instance.channel = None
            cls._instance.exchange = "campaigncell.events"
            cls._instance.queue_name = "q.ai.campaign-events"
        return cls._instance

    def connect(self):
        url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672")
        try:
            parameters = pika.URLParameters(url)
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()

            self.channel.exchange_declare(
                exchange=self.exchange,
                exchange_type="topic",
                durable=True
            )

            self.channel.queue_declare(queue=self.queue_name, durable=True)
            
            # Routing key binding
            binding_keys = [
                "campaign.created",
                "campaign.optimization.required",
                "segment.changed",
                "subscriber.offer.#"
            ]
            for key in binding_keys:
                self.channel.queue_bind(
                    exchange=self.exchange,
                    queue=self.queue_name,
                    routing_key=key
                )

            logger.info(f"RabbitMQ bağlantısı sağlandı. Queue '{self.queue_name}' dinleniyor.")
            return True
        except Exception as e:
            logger.warning(f"RabbitMQ bağlantısı kurulamadı (Event işlemleri devredışı/asenkron çalışıyor): {e}")
            return False

    def publish_event(self, event_type: str, payload: dict):
        if not self.channel or self.channel.is_closed:
            logger.warn(f"RabbitMQ kanalı kapalı. Event '{event_type}' atlandı.")
            return False

        envelope = {
            "event_type": eventType if (eventType := event_type) else event_type,
            "event_id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "ai-service",
            "version": "1.0",
            "payload": payload,
        }

        try:
            self.channel.basic_publish(
                exchange=self.exchange,
                routing_key=event_type,
                body=json.dumps(envelope),
                properties=pika.BasicProperties(
                    delivery_mode=2, # persistent
                    content_type="application/json"
                )
            )
            logger.info(f"Event [{event_type}] başarıyla yayınlandı.")
            return True
        except Exception as e:
            logger.error(f"Event [{event_type}] yayınlama hatası: {e}")
            return False

    def publish_recovered_event(self):
        """
        AI Servisi ayağa kalktığında Campaign Service'i bilgilendirmek için ai.service.recovered fırlatır.
        """
        return self.publish_event("ai.service.recovered", {
            "service": "ai-service",
            "status": "UP",
            "recovered_at": datetime.now(timezone.utc).isoformat(),
            "message": "AI Servisi aktif. Manuel optimizasyon bekleyen kampanyalar işlenebilir."
        })

    def start_consumer(self, callback_handler):
        """
        Arka plan thread'inde RabbitMQ dinleyicisini çalıştırır.
        """
        def _consume():
            if not self.connect():
                return
            
            def _on_message(ch, method, properties, body):
                try:
                    data = json.loads(body)
                    callback_handler(method.routing_key, data)
                    ch.basic_ack(delivery_tag=method.delivery_tag)
                except Exception as err:
                    logger.error(f"Mesaj işleme hatası: {err}")
                    ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

            self.channel.basic_consume(
                queue=self.queue_name,
                on_message_callback=_on_message
            )
            try:
                self.channel.start_consuming()
            except Exception as e:
                logger.warning(f"RabbitMQ consumer durdu: {e}")

        thread = threading.Thread(target=_consume, daemon=True)
        thread.start()
