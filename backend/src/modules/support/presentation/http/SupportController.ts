import { Request, Response, NextFunction } from 'express';
import { CreateSupportMessage } from '../../application/use-cases/CreateSupportMessage';
import { ListSupportMessages } from '../../application/use-cases/ListSupportMessages';
import { GetUnreadSupportCount } from '../../application/use-cases/GetUnreadSupportCount';
import { UpdateSupportStatus } from '../../application/use-cases/UpdateSupportStatus';

export class SupportController {
  constructor(
    private readonly createSupportMessage: CreateSupportMessage,
    private readonly listSupportMessages: ListSupportMessages,
    private readonly getUnreadSupportCountUseCase: GetUnreadSupportCount,
    private readonly updateSupportStatusUseCase: UpdateSupportStatus
  ) {}

  public contact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await this.createSupportMessage.execute(req.body);
      res.status(201).json(message); // Remove success wrapper
    } catch (error) {
      next(error);
    }
  };

  public getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await this.listSupportMessages.execute();
      res.status(200).json(messages); // Remove success wrapper
    } catch (error) {
      next(error);
    }
  };

  public getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await this.getUnreadSupportCountUseCase.execute();
      res.status(200).json(count);
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const updatedMessage = await this.updateSupportStatusUseCase.execute(id, status);
      res.status(200).json(updatedMessage);
    } catch (error) {
      next(error);
    }
  };
}
