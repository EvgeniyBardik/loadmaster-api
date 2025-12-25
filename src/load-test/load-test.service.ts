import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { LoadTest } from '../database/models/load-test.model';
import { TestResult } from '../database/models/test-result.model';
import { User } from '../database/models/user.model';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { CreateLoadTestInput, UpdateLoadTestInput } from './dto/load-test.input';

@Injectable()
export class LoadTestService {
  constructor(
    @InjectModel(LoadTest)
    private loadTestModel: typeof LoadTest,
    @InjectModel(TestResult)
    private testResultModel: typeof TestResult,
    private rabbitMQService: RabbitMQService,
    private configService: ConfigService,
  ) {}

  async create(userId: string, input: CreateLoadTestInput): Promise<LoadTest> {
    // Validate limits based on user plan
    const user = await this.validateLimits(userId, input);

    const loadTest = await this.loadTestModel.create({
      ...input,
      userId,
      status: 'pending',
    });

    return loadTest;
  }

  async findAll(userId: string): Promise<LoadTest[]> {
    return this.loadTestModel.findAll({
      where: { userId },
      include: [TestResult],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string, userId: string): Promise<LoadTest> {
    const loadTest = await this.loadTestModel.findOne({
      where: { id, userId },
      include: [TestResult, User],
    });

    if (!loadTest) {
      throw new NotFoundException('Load test not found');
    }

    return loadTest;
  }

  async update(id: string, userId: string, input: UpdateLoadTestInput): Promise<LoadTest> {
    const loadTest = await this.findOne(id, userId);

    if (loadTest.status === 'running') {
      throw new BadRequestException('Cannot update a running test');
    }

    await loadTest.update(input);
    return loadTest;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const loadTest = await this.findOne(id, userId);

    if (loadTest.status === 'running') {
      throw new BadRequestException('Cannot delete a running test');
    }

    await loadTest.destroy();
    return true;
  }

  async startTest(id: string, userId: string): Promise<LoadTest> {
    const loadTest = await this.findOne(id, userId);

    if (loadTest.status === 'running') {
      throw new BadRequestException('Test is already running');
    }

    // Update status to queued
    await loadTest.update({
      status: 'queued',
      startedAt: new Date(),
    });

    // Send to RabbitMQ queue for processing
    await this.rabbitMQService.publishLoadTest({
      testId: loadTest.id,
      targetUrl: loadTest.targetUrl,
      method: loadTest.method,
      concurrentUsers: loadTest.concurrentUsers,
      totalRequests: loadTest.totalRequests,
      durationSeconds: loadTest.durationSeconds,
      requestsPerSecond: loadTest.requestsPerSecond,
      headers: loadTest.headers,
      body: loadTest.body,
    });

    return loadTest;
  }

  async stopTest(id: string, userId: string): Promise<LoadTest> {
    const loadTest = await this.findOne(id, userId);

    if (loadTest.status !== 'running' && loadTest.status !== 'queued') {
      throw new BadRequestException('Test is not running');
    }

    await loadTest.update({
      status: 'cancelled',
      completedAt: new Date(),
    });

    return loadTest;
  }

  async updateTestStatus(
    testId: string,
    status: string,
    completedAt?: Date,
  ): Promise<LoadTest> {
    const loadTest = await this.loadTestModel.findByPk(testId);

    if (!loadTest) {
      throw new NotFoundException('Load test not found');
    }

    await loadTest.update({
      status,
      completedAt,
    });

    return loadTest;
  }

  async saveTestResult(testId: string, resultData: any): Promise<TestResult> {
    return this.testResultModel.create({
      loadTestId: testId,
      ...resultData,
    });
  }

  async getTestResults(testId: string, userId: string): Promise<TestResult[]> {
    const loadTest = await this.findOne(testId, userId);
    return this.testResultModel.findAll({
      where: { loadTestId: loadTest.id },
      order: [['createdAt', 'DESC']],
    });
  }

  private async validateLimits(userId: string, input: CreateLoadTestInput): Promise<User> {
    // This would fetch the user and check their plan limits
    // For now, we'll use config values
    const maxRPS = this.configService.get<number>('MAX_RPS_PER_TEST') || 100;
    const maxDuration = this.configService.get<number>('MAX_DURATION_SECONDS') || 300;

    if (input.requestsPerSecond > maxRPS) {
      throw new BadRequestException(
        `Requests per second cannot exceed ${maxRPS} on your plan`,
      );
    }

    if (input.durationSeconds > maxDuration) {
      throw new BadRequestException(`Duration cannot exceed ${maxDuration} seconds on your plan`);
    }

    return null; // In real implementation, return the user
  }

  async getStatistics(userId: string): Promise<any> {
    const tests = await this.loadTestModel.findAll({
      where: { userId },
      include: [TestResult],
    });

    const totalTests = tests.length;
    const completedTests = tests.filter((t) => t.status === 'completed').length;
    const runningTests = tests.filter((t) => t.status === 'running').length;
    const failedTests = tests.filter((t) => t.status === 'failed').length;

    return {
      totalTests,
      completedTests,
      runningTests,
      failedTests,
      successRate: totalTests > 0 ? (completedTests / totalTests) * 100 : 0,
    };
  }
}

