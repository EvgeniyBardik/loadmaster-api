import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

export interface LoadTestMessage {
  testId: string;
  targetUrl: string;
  method: string;
  concurrentUsers: number;
  totalRequests: number;
  durationSeconds: number;
  requestsPerSecond: number;
  headers?: object;
  body?: object;
}

export interface TestResultMessage {
  testId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  statusCodeDistribution: object;
  errorDistribution: object;
  timeSeriesData: object;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly queueName = 'load_tests';
  private readonly resultsQueueName = 'test_results';
  private readonly metricsQueueName = 'test_metrics';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const host = this.configService.get('RABBITMQ_HOST') || 'localhost';
      const port = this.configService.get('RABBITMQ_PORT') || 5672;
      const user = this.configService.get('RABBITMQ_USER') || 'guest';
      const password = this.configService.get('RABBITMQ_PASSWORD') || 'guest';

      this.connection = await amqp.connect({
        protocol: 'amqp',
        hostname: host,
        port: port,
        username: user,
        password: password,
      });

      this.channel = await this.connection.createChannel();

      // Declare queues
      await this.channel.assertQueue(this.queueName, { durable: true });
      await this.channel.assertQueue(this.resultsQueueName, { durable: true });
      await this.channel.assertQueue(this.metricsQueueName, { durable: true });

      this.logger.log('✅ Connected to RabbitMQ successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to RabbitMQ:', error.message);
      // In development, this is okay - workers might not be running
      if (this.configService.get('NODE_ENV') === 'production') {
        throw error;
      }
    }
  }

  private async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ:', error.message);
    }
  }

  async publishLoadTest(message: LoadTestMessage): Promise<boolean> {
    try {
      if (!this.channel) {
        this.logger.warn('RabbitMQ channel not available, skipping message publish');
        return false;
      }

      const sent = this.channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
        },
      );

      this.logger.log(`📤 Published load test to queue: ${message.testId}`);
      return sent;
    } catch (error) {
      this.logger.error('Failed to publish load test:', error.message);
      return false;
    }
  }

  async consumeResults(callback: (result: TestResultMessage) => Promise<void>): Promise<void> {
    if (!this.channel) {
      this.logger.warn('RabbitMQ channel not available');
      return;
    }

    await this.channel.consume(
      this.resultsQueueName,
      async (msg) => {
        if (msg) {
          try {
            const result: TestResultMessage = JSON.parse(msg.content.toString());
            await callback(result);
            this.channel.ack(msg);
            this.logger.log(`📥 Processed test result: ${result.testId}`);
          } catch (error) {
            this.logger.error('Error processing result:', error.message);
            this.channel.nack(msg, false, false);
          }
        }
      },
      {
        noAck: false,
      },
    );

    this.logger.log('🎧 Started consuming test results');
  }

  async consumeMetrics(
    callback: (metric: any) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      this.logger.warn('RabbitMQ channel not available');
      return;
    }

    await this.channel.consume(
      this.metricsQueueName,
      async (msg) => {
        if (msg) {
          try {
            const metric = JSON.parse(msg.content.toString());
            await callback(metric);
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('Error processing metric:', error.message);
            this.channel.nack(msg, false, false);
          }
        }
      },
      {
        noAck: false,
      },
    );

    this.logger.log('🎧 Started consuming metrics');
  }

  async getQueueInfo(queueName: string): Promise<amqp.Replies.AssertQueue | null> {
    try {
      if (!this.channel) {
        return null;
      }
      return await this.channel.checkQueue(queueName);
    } catch (error) {
      this.logger.error(`Error getting queue info for ${queueName}:`, error.message);
      return null;
    }
  }
}

