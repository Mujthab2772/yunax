import { Request, Response, NextFunction } from 'express';
import { GetDashboardStats } from '../../application/use-cases/GetDashboardStats';

export class AdminAnalyticsController {
  constructor(private readonly getDashboardStatsUseCase: GetDashboardStats) {}

  public getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.getDashboardStatsUseCase.execute();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };
}
