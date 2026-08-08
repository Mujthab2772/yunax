export class SupportMessage {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly message: string,
    public readonly phone?: string,
    public readonly subject?: string,
    public readonly source?: string,
    public status: string = 'new',
    public readonly createdAt: Date = new Date()
  ) {}
}
