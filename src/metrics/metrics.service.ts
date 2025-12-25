import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Metric } from '../database/models/metric.model';
import { Op } from 'sequelize';

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(Metric)
    private metricModel: typeof Metric,
  ) {}

  async create(metricData: any): Promise<Metric> {
    return this.metricModel.create(metricData);
  }

  async findByLoadTest(loadTestId: string): Promise<Metric[]> {
    return this.metricModel.findAll({
      where: { loadTestId },
      order: [['timestamp', 'ASC']],
    });
  }

  async findByTimeRange(
    loadTestId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Metric[]> {
    return this.metricModel.findAll({
      where: {
        loadTestId,
        timestamp: {
          [Op.between]: [startTime, endTime],
        },
      },
      order: [['timestamp', 'ASC']],
    });
  }

  async getAggregatedMetrics(loadTestId: string): Promise<any> {
    const metrics = await this.findByLoadTest(loadTestId);

    if (metrics.length === 0) {
      return null;
    }

    const totalRequests = metrics.reduce((sum, m) => sum + m.requestCount, 0);
    const totalSuccess = metrics.reduce((sum, m) => sum + m.successCount, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
    const avgResponseTime =
      metrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / metrics.length;

    return {
      totalRequests,
      totalSuccess,
      totalErrors,
      avgResponseTime,
      errorRate: totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0,
      dataPoints: metrics.length,
    };
  }

  async deleteByLoadTest(loadTestId: string): Promise<number> {
    return this.metricModel.destroy({
      where: { loadTestId },
    });
  }
}

