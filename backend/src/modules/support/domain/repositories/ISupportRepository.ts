import { SupportMessage } from '../entities/SupportMessage';

export interface ISupportRepository {
  save(message: SupportMessage): Promise<SupportMessage>;
  listAll(): Promise<SupportMessage[]>;
  getUnreadCount(): Promise<number>;
  getById(id: string): Promise<SupportMessage | null>;
}
