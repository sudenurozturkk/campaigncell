import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { randomUUID } from 'crypto';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly exchangeName = 'campaigncell.events';

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (err) {
      this.logger.error('RabbitMQ kapatılırken hata:', err);
    }
  }

  private async connect() {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      this.logger.log(`RabbitMQ sunucusuna bağlandı, exchange '${this.exchangeName}' hazır.`);
    } catch (error) {
      this.logger.warn(`RabbitMQ bağlantısı kurulamadı (asenkron mesajlaşma devredışı/retry modunda): ${error.message}`);
    }
  }

  async publishEvent(eventType: string, payload: any) {
    if (!this.channel) {
      this.logger.warn(`RabbitMQ kanalı aktif değil. Event '${eventType}' atlandı.`);
      return false;
    }

    const envelope = {
      event_type: eventType,
      event_id: randomUUID(),
      timestamp: new Date().toISOString(),
      source: 'campaign-service',
      version: '1.0',
      payload,
    };

    const routingKey = eventType; // örn: campaign.created, campaign.optimized
    const content = Buffer.from(JSON.stringify(envelope));

    const published = this.channel.publish(this.exchangeName, routingKey, content, {
      persistent: true,
      contentType: 'application/json',
    });

    if (published) {
      this.logger.log(`Event [${eventType}] başarıyla yayınlandı. RoutingKey: ${routingKey}`);
    } else {
      this.logger.warn(`Event [${eventType}] yayınlanamadı (buffer dolu).`);
    }

    return published;
  }
}
